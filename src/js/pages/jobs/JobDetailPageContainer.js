import { StoreMixin } from "mesosphere-shared-reactjs";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { routerShape } from "react-router";
import mixin from "reactjs-mixin";

import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import MetronomeStore from "#SRC/js/stores/MetronomeStore";
import JobDetailPage from "./JobDetailPage";
import JobsBreadcrumbs from "../../components/JobsBreadcrumbs";

export const DIALOGS = {
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
export class JobDetailPageContainer extends mixin(StoreMixin) {
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
      errorCount: 0,
      isJobFormModalOpen: false,
      isLoading: true,
      disabledDialog: null,
      jobActionDialog: null
    };

    [
      "onMetronomeStoreJobDetailError",
      "onMetronomeStoreJobDetailChange",
      "handleRunNowButtonClick",
      "handleDisableScheduleButtonClick",
      "handleEnableScheduleButtonClick",
      "closeDialog",
      "onJobDeleteSuccess",
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

  onJobDeleteSuccess() {
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
      onJobDeleteSuccess: this.onJobDeleteSuccess,
      closeDialog: this.closeDialog,
      job,
      jobTree,
      disabledDialog: this.state.disabledDialog,
      jobActionDialog: this.state.jobActionDialog
    };

    return <JobDetailPage {...this.props} {...props} />;
  }
}
JobDetailPageContainer.contextTypes = {
  router: routerShape
};

export default JobDetailPageContainer;
