import classNames from "classnames";
import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import prettycron from "prettycron";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { routerShape } from "react-router";

import { StoreMixin } from "mesosphere-shared-reactjs";

import Icon from "../../components/Icon";
import JobConfiguration from "./JobConfiguration";
import JobFormModal from "../../components/modals/JobFormModal";
import JobRunHistoryTable from "./JobRunHistoryTable";
import JobsBreadcrumbs from "../../components/breadcrumbs/JobsBreadcrumbs";
import Loader from "../../components/Loader";
import MetronomeStore from "../../stores/MetronomeStore";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import StringUtil from "../../utils/StringUtil";
import TabsMixin from "../../mixins/TabsMixin";
import TimeAgo from "../../components/TimeAgo";
import TaskStates
  from "../../../../plugins/services/src/js/constants/TaskStates";

const METHODS_TO_BIND = [
  "closeDialog",
  "handleEditButtonClick",
  "handleRunNowButtonClick",
  "handleDisableScheduleButtonClick",
  "handleEnableScheduleButtonClick",
  "handleDestroyButtonClick",
  "onMetronomeStoreJobDeleteError",
  "onMetronomeStoreJobDeleteSuccess",
  "onMetronomeStoreJobDetailError",
  "onMetronomeStoreJobDetailChange"
];

const DIALOGS = {
  EDIT: "edit",
  DESTROY: "destroy"
};

class JobDetailPage extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "metronome",
        events: [
          "jobDeleteSuccess",
          "jobDeleteError",
          "jobDetailChange",
          "jobDetailError",
          "jobRunError",
          "jobRunSuccess",
          "jobScheduleUpdateError",
          "jobScheduleUpdateSuccess"
        ],
        suppressUpdate: false
      }
    ];

    this.tabs_tabs = {
      runHistory: "Run History",
      configuration: "Configuration"
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      disabledDialog: null,
      jobActionDialog: null,
      errorMsg: null,
      errorCount: 0,
      isJobFormModalOpen: false,
      isLoading: true
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    MetronomeStore.monitorJobDetail(this.props.params.id);
  }

  componentWillUnmount() {
    super.componentWillUnmount(...arguments);
    MetronomeStore.stopJobDetailMonitor(this.props.params.id);
  }

  onMetronomeStoreJobDeleteError(id, error) {
    const { message: errorMsg } = error;
    if (id !== this.props.params.id || errorMsg == null) {
      return;
    }

    this.setState({
      jobActionDialog: DIALOGS.DESTROY,
      disabledDialog: null,
      errorMsg
    });
  }

  onMetronomeStoreJobDeleteSuccess() {
    this.closeDialog();
    this.context.router.push("/jobs");
  }

  onMetronomeStoreJobDetailError() {
    this.setState({ errorCount: this.state.errorCount + 1 });
  }

  onMetronomeStoreJobDetailChange() {
    this.setState({ errorCount: 0, isLoading: false });
  }

  handleEditButtonClick() {
    this.setState({ jobActionDialog: DIALOGS.EDIT });
  }

  handleRunNowButtonClick() {
    const job = MetronomeStore.getJob(this.props.params.id);

    MetronomeStore.runJob(job.getId());
  }

  handleDisableScheduleButtonClick() {
    MetronomeStore.toggleSchedule(this.props.params.id, false);
  }

  handleEnableScheduleButtonClick() {
    MetronomeStore.toggleSchedule(this.props.params.id, true);
  }

  handleDestroyButtonClick() {
    this.setState({ jobActionDialog: DIALOGS.DESTROY });
  }

  handleAcceptDestroyDialog(stopCurrentJobRuns = false) {
    this.setState({ disabledDialog: DIALOGS.DESTROY }, () => {
      MetronomeStore.deleteJob(this.props.params.id, stopCurrentJobRuns);
    });
  }

  handleMoreDropdownSelection(selection) {
    if (selection.id === DIALOGS.SCHEDULE_DISABLE) {
      MetronomeStore.toggleSchedule(this.props.params.id, false);

      return;
    }

    if (selection.id === DIALOGS.SCHEDULE_ENABLE) {
      MetronomeStore.toggleSchedule(this.props.params.id, true);

      return;
    }

    this.setState({ jobActionDialog: selection.id });
  }

  closeDialog() {
    this.setState({
      disabledDialog: null,
      errorMsg: null,
      jobActionDialog: null
    });
  }

  getDestroyConfirmDialog() {
    const { id } = this.props.params;
    const { disabledDialog, jobActionDialog, errorMsg } = this.state;
    let stopCurrentJobRuns = false;
    let actionButtonLabel = "Destroy Job";
    let message =
      `Are you sure you want to destroy ${id}? ` +
      "This action is irreversible.";

    if (/stopCurrentJobRuns=true/.test(errorMsg)) {
      actionButtonLabel = "Stop Current Runs and Destroy Job";
      stopCurrentJobRuns = true;
      message =
        `Couldn't destroy ${id} as there are currently active job ` +
        "runs. Do you want to stop all runs and destroy the job?";
    }

    const content = (
      <div>
        <h2 className="text-danger text-align-center flush-top">
          Destroy Job
        </h2>
        <p>{message}</p>
      </div>
    );

    return (
      <Confirm
        children={content}
        disabled={disabledDialog === DIALOGS.DESTROY}
        open={jobActionDialog === DIALOGS.DESTROY}
        onClose={this.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.closeDialog}
        rightButtonText={actionButtonLabel}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleAcceptDestroyDialog.bind(
          this,
          stopCurrentJobRuns
        )}
      />
    );
  }

  getErrorScreen() {
    return (
      <Page>
        <Page.Header breadcrumbs={<JobsBreadcrumbs />} />
        <RequestErrorMsg />
      </Page>
    );
  }

  getLoadingScreen() {
    return (
      <Page>
        <Page.Header breadcrumbs={<JobsBreadcrumbs />} />
        <Loader />
      </Page>
    );
  }

  getNavigationTabs() {
    return (
      <ul className="menu-tabbed">
        {this.tabs_getUnroutedTabs()}
      </ul>
    );
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

  getJobStatus(job) {
    let longestRunningTask = null;
    const longestRunningActiveRun = job
      .getActiveRuns()
      .getLongestRunningActiveRun();

    if (longestRunningActiveRun != null) {
      longestRunningTask = longestRunningActiveRun
        .getTasks()
        .getLongestRunningTask();
    }

    if (longestRunningTask == null) {
      return null;
    }

    const status = TaskStates[longestRunningTask.getStatus()];

    return status.displayName;
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
        "text-success": status.stateTypes.includes("success") &&
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
    const job = MetronomeStore.getJob(this.props.params.id);
    const [schedule] = job.getSchedules();

    const actions = [];

    actions.push({
      label: "Edit",
      onItemSelect: this.handleEditButtonClick
    });

    actions.push({
      label: "Run Now",
      onItemSelect: this.handleRunNowButtonClick
    });

    if (schedule != null && schedule.enabled) {
      actions.push({
        label: "Disable Schedule",
        onItemSelect: this.handleDisableScheduleButtonClick
      });
    }

    if (schedule != null && !schedule.enabled) {
      actions.push({
        label: "Enable Schedule",
        onItemSelect: this.handleEnableScheduleButtonClick
      });
    }

    actions.push({
      className: "text-danger",
      label: "Destroy",
      onItemSelect: this.handleDestroyButtonClick
    });

    return actions;
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
    if (this.state.errorCount > 3) {
      return this.getErrorScreen();
    }

    if (this.state.isLoading) {
      return this.getLoadingScreen();
    }

    // TaskDetailView
    if (this.props.params.taskID) {
      return this.props.children;
    }

    const job = MetronomeStore.getJob(this.props.params.id);
    const jobStatus = this.getJobStatus(job);
    const jobSchedules = job.getSchedules();

    const breadcrumbs = (
      <JobsBreadcrumbs
        jobID={job.getId()}
        jobSchedules={jobSchedules}
        jobStatus={jobStatus}
      />
    );

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          breadcrumbs={breadcrumbs}
          tabs={this.getTabs()}
        />
        {this.tabs_getTabView(job)}
        <JobFormModal
          isEdit={true}
          job={job}
          open={this.state.jobActionDialog === DIALOGS.EDIT}
          onClose={this.closeDialog}
        />
        {this.getDestroyConfirmDialog()}
      </Page>
    );
  }
}

JobDetailPage.contextTypes = {
  router: routerShape
};

module.exports = JobDetailPage;
