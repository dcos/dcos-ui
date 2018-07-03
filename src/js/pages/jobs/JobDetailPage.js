import classNames from "classnames";
import prettycron from "prettycron";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { routerShape } from "react-router";
import mixin from "reactjs-mixin";

import JobCreateEditFormModal from "#PLUGINS/jobs/src/js/JobCreateEditFormModal";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";
import jobsMenu from "#PLUGINS/jobs/src/js/jobsMenu";
import JobDelete from "#PLUGINS/jobs/src/js/JobDelete";
import JobsBreadcrumbs from "../../components/JobsBreadcrumbs";

import Icon from "../../components/Icon";
import Page from "../../components/Page";
import TimeAgo from "../../components/TimeAgo";
import TabsMixin from "../../mixins/TabsMixin";
import StringUtil from "../../utils/StringUtil";
import JobConfiguration from "./JobConfiguration";
import { DIALOGS } from "./JobDetailPageContainer";
import JobRunHistoryTable from "./JobRunHistoryTable";

class JobDetailPage extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      runHistory: "Run History",
      configuration: "Configuration"
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };
  }

  getNavigationTabs() {
    return <ul className="menu-tabbed">{this.tabs_getUnroutedTabs()}</ul>;
  }

  getPrettySchedule(job) {
    const schedules = job.getSchedules();
    if (schedules == null || schedules.length === 0) {
      return null;
    }

    const schedule = schedules[0];
    if (schedule.enabled) {
      return prettycron.toString(schedule.cron);
    }
  }

  getSubTitle(job) {
    const nodes = [];
    const scheduleText = this.getPrettySchedule(job);
    let longestRunningTask = null;
    const longestRunningActiveRun = job
      .getActiveRuns()
      .getLongestRunningActiveRun();

    if (longestRunningActiveRun != null) {
      longestRunningTask = longestRunningActiveRun
        .getTasks()
        .getLongestRunningTask();
    }

    if (longestRunningTask == null && scheduleText == null) {
      return null;
    }

    if (scheduleText != null) {
      nodes.push(
        <p className="text-overflow flush" key="schedule-text">
          <Icon
            className="icon-margin-right"
            key="schedule-icon"
            color="grey"
            id="repeat"
            size="mini"
          />
          <span>Scheduled {StringUtil.lowercase(scheduleText)}</span>
        </p>
      );
    }

    if (longestRunningTask != null) {
      const dateCompleted = longestRunningTask.getDateCompleted();

      const status = TaskStates[longestRunningTask.getStatus()];
      const statusClasses = classNames("job-details-header-status", {
        "text-success":
          status.stateTypes.includes("success") &&
          !status.stateTypes.includes("failure"),
        "text-danger": status.stateTypes.includes("failure")
      });

      let timePrefix = null;
      const shouldSuppressRelativeTime = dateCompleted == null;

      if (shouldSuppressRelativeTime) {
        timePrefix = "for ";
      }

      nodes.push(
        <span className={statusClasses} key="status-text">
          {status.displayName}
        </span>,
        <span key="time-running">
          <TimeAgo
            prefix={timePrefix}
            suppressSuffix={shouldSuppressRelativeTime}
            time={longestRunningActiveRun.getDateCreated()}
          />
        </span>
      );
    }

    return nodes;
  }

  renderConfigurationTabView(job) {
    return <JobConfiguration job={job} />;
  }

  renderRunHistoryTabView(job) {
    return <JobRunHistoryTable job={job} />;
  }

  getActions() {
    const job = this.props.job;

    const customActionHandlers = {
      edit: this.props.handleEditButtonClick,
      delete: this.props.handleDestroyButtonClick
    };

    return jobsMenu(job, customActionHandlers);
  }

  getTabs() {
    const activeTab = this.state.currentTab;

    return [
      {
        label: "Run History",
        callback: () => {
          this.setState({ currentTab: "runHistory" });
        },
        isActive: activeTab === "runHistory"
      },
      {
        label: "Configuration",
        callback: () => {
          this.setState({ currentTab: "configuration" });
        },
        isActive: activeTab === "configuration"
      }
    ];
  }

  render() {
    // TaskDetailView
    if (this.props.params.taskID) {
      return this.props.children;
    }

    const { params, job, jobTree } = this.props;

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          breadcrumbs={<JobsBreadcrumbs tree={jobTree} item={job} />}
          tabs={this.getTabs()}
        />
        {this.tabs_getTabView(job)}
        <JobCreateEditFormModal
          isEdit={true}
          job={job}
          open={this.props.jobActionDialog === DIALOGS.EDIT}
          onClose={this.props.closeDialog}
        />
        <JobDelete
          jobId={params.id}
          open={this.props.jobActionDialog === DIALOGS.DESTROY}
          onSuccess={this.props.onJobDeleteSuccess}
          onClose={this.props.closeDialog}
        />
      </Page>
    );
  }
}

JobDetailPage.contextTypes = {
  router: routerShape
};

module.exports = JobDetailPage;
