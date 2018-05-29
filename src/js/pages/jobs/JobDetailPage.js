import classNames from "classnames";
import { StoreMixin } from "mesosphere-shared-reactjs";
import prettycron from "prettycron";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { routerShape } from "react-router";
import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import TaskStates from "../../../../plugins/services/src/js/constants/TaskStates";
import Icon from "../../components/Icon";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import TimeAgo from "../../components/TimeAgo";
import JobsBreadcrumbs from "../../components/breadcrumbs/JobsBreadcrumbs";
import JobFormModal from "../../components/modals/JobFormModal";
import UserActions from "../../constants/UserActions";
import TabsMixin from "../../mixins/TabsMixin";
import MetronomeStore from "../../stores/MetronomeStore";
import StringUtil from "../../utils/StringUtil";
import JobConfiguration from "./JobConfiguration";
import JobRunHistoryTable from "./JobRunHistoryTable";

const METHODS_TO_BIND = [];

const DIALOGS = {
  EDIT: "edit",
  DESTROY: "destroy"
};

const LoadingScreen = function({ jobTree }) {
  return (
    <Page>
      <Page.Header breadcrumbs={<JobsBreadcrumbs tree={jobTree} />} />
      <Loader />
    </Page>
  );
};

const ErrorScreen = function({ jobTree }) {
  return (
    <Page>
      <Page.Header breadcrumbs={<JobsBreadcrumbs tree={jobTree} />} />
      <RequestErrorMsg />
    </Page>
  );
};

class JobDetailPageContainer extends mixin(StoreMixin) {
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

    this.state = {
      errorMsg: null,
      errorCount: 0,
      isJobFormModalOpen: false,
      isLoading: true,
      disabledDialog: null,
      jobActionDialog: null
    };

    [
      "onMetronomeStoreJobDeleteError",
      "onMetronomeStoreJobDeleteSuccess",
      "onMetronomeStoreJobDetailError",
      "onMetronomeStoreJobDetailChange",
      "handleRunNowButtonClick",
      "handleDisableScheduleButtonClick",
      "handleEnableScheduleButtonClick",
      "handleAcceptDestroyDialog",
      "closeDialog",
      "handleEditButtonClick",
      "handleDestroyButtonClick"
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  closeDialog() {
    this.setState({
      disabledDialog: null,
      jobActionDialog: null
    });
  }

  handleEditButtonClick() {
    this.setState({ jobActionDialog: DIALOGS.EDIT });
  }

  handleDestroyButtonClick() {
    this.setState({ jobActionDialog: DIALOGS.DESTROY });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    MetronomeStore.monitorJobDetail(this.props.params.id);
  }

  componentWillUnmount() {
    super.componentWillUnmount(...arguments);
    MetronomeStore.stopJobDetailMonitor(this.props.params.id);
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

  handleAcceptDestroyDialog(stopCurrentJobRuns = false) {
    MetronomeStore.deleteJob(this.props.params.id, stopCurrentJobRuns);
  }

  onMetronomeStoreJobDeleteError(id, error) {
    const { message: errorMsg } = error;
    if (id !== this.props.params.id || errorMsg == null) {
      return;
    }

    this.setState({
      jobActionDialog: DIALOGS.DESTROY,
      errorMsg
    });
  }

  onMetronomeStoreJobDeleteSuccess() {
    // TODO: remove the closeDialog here.
    this.closeDialog();
    this.context.router.push("/jobs");
  }

  onMetronomeStoreJobDetailError() {
    this.setState({ errorCount: this.state.errorCount + 1 });
  }

  onMetronomeStoreJobDetailChange() {
    this.setState({ errorCount: 0, isLoading: false });
  }

  render() {
    const jobTree = MetronomeStore.jobTree;
    if (this.state.errorCount > 3) {
      return <ErrorScreen jobTree={jobTree} />;
    }

    if (this.state.isLoading) {
      return <LoadingScreen jobTree={jobTree} />;
    }

    const job = MetronomeStore.getJob(this.props.params.id);
    const props = {
      handleEditButtonClick: this.handleEditButtonClick,
      handleRunNowButtonClick: this.handleRunNowButtonClick,
      handleDisableScheduleButtonClick: this.handleDisableScheduleButtonClick,
      handleEnableScheduleButtonClick: this.handleEnableScheduleButtonClick,
      handleDestroyButtonClick: this.handleDestroyButtonClick,
      handleAcceptDestroyDialog: this.handleAcceptDestroyDialog,
      closeDialog: this.closeDialog,
      job,
      jobTree,
      errorMsg: this.state.errorMsg,
      disabledDialog: this.state.disabledDialog,
      jobActionDialog: this.state.jobActionDialog
    };

    return <JobDetailPage {...this.props} {...props} />;
  }
}
JobDetailPageContainer.contextTypes = {
  router: routerShape
};

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

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getDestroyConfirmDialog() {
    const { id } = this.props.params;
    const { jobActionDialog, disabledDialog, errorMsg } = this.props;
    let stopCurrentJobRuns = false;
    let actionButtonLabel = `${StringUtil.capitalize(UserActions.DELETE)} Job`;
    let message =
      `Are you sure you want to ${UserActions.DELETE} ${id}? ` +
      "This action is irreversible.";

    if (/stopCurrentJobRuns=true/.test(errorMsg)) {
      actionButtonLabel = `Stop Current Runs and ${StringUtil.capitalize(
        UserActions.DELETE
      )} Job`;
      stopCurrentJobRuns = true;
      message = `Couldn't ${
        UserActions.DELETE
      } ${id} as there are currently active job runs. Do you want to stop all runs and ${
        UserActions.DELETE
      } the job?`;
    }

    const content = (
      <div>
        <h2 className="text-danger text-align-center flush-top">
          {StringUtil.capitalize(UserActions.DELETE)} Job
        </h2>
        <p>{message}</p>
      </div>
    );

    return (
      <Confirm
        children={content}
        disabled={disabledDialog === DIALOGS.DESTROY}
        open={jobActionDialog === DIALOGS.DESTROY}
        onClose={this.props.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.props.closeDialog}
        leftButtonClassName="button button-primary-link"
        rightButtonText={actionButtonLabel}
        rightButtonClassName="button button-danger"
        rightButtonCallback={() =>
          this.setState({ disabledDialog: DIALOGS.DESTROY }, () => {
            this.props.handleAcceptDestroyDialog(stopCurrentJobRuns);
          })
        }
      />
    );
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
    const [schedule] = job.getSchedules();

    const actions = [];

    actions.push({
      label: "Edit",
      onItemSelect: this.props.handleEditButtonClick
    });

    actions.push({
      label: "Run Now",
      onItemSelect: this.props.handleRunNowButtonClick
    });

    if (schedule != null && schedule.enabled) {
      actions.push({
        label: "Disable Schedule",
        onItemSelect: this.props.handleDisableScheduleButtonClick
      });
    }

    if (schedule != null && !schedule.enabled) {
      actions.push({
        label: "Enable Schedule",
        onItemSelect: this.props.handleEnableScheduleButtonClick
      });
    }

    actions.push({
      className: "text-danger",
      label: StringUtil.capitalize(UserActions.DELETE),
      onItemSelect: this.props.handleDestroyButtonClick
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
    // TaskDetailView
    if (this.props.params.taskID) {
      return this.props.children;
    }

    const { job, jobTree } = this.props;

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          breadcrumbs={<JobsBreadcrumbs tree={jobTree} item={job} />}
          tabs={this.getTabs()}
        />
        {this.tabs_getTabView(job)}
        <JobFormModal
          isEdit={true}
          job={job}
          open={this.props.jobActionDialog === DIALOGS.EDIT}
          onClose={this.props.closeDialog}
        />
        {this.getDestroyConfirmDialog()}
      </Page>
    );
  }
}

JobDetailPage.contextTypes = {
  router: routerShape
};

module.exports = JobDetailPageContainer;
