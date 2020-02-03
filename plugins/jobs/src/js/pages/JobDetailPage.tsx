import { i18nMark } from "@lingui/react";

import * as React from "react";

import { routerShape } from "react-router";
import PropTypes from "prop-types";

import Page from "#SRC/js/components/Page";
import Util from "#SRC/js/utils/Util";

import JobFormModal from "../components/JobsFormModal";
import JobConfiguration from "./JobConfiguration";
import { DIALOGS } from "../JobDetailPageContainer";
import JobRunHistoryTable from "./JobRunHistoryTable";
import ItemSchedule from "../components/breadcrumbs/Schedule";
import ItemStatus from "../components/breadcrumbs/Status";
import Breadcrumbs from "../components/Breadcrumbs";
import JobDelete from "../JobDelete";

import jobsMenu from "../jobsMenu";

class JobDetailPage extends React.Component<{ currentTab: string; job: {} }> {
  static propTypes = {
    children: PropTypes.any,
    closeDialog: PropTypes.func,
    handleEditButtonClick: PropTypes.func.isRequired,
    handleDestroyButtonClick: PropTypes.func.isRequired,
    onJobDeleteSuccess: PropTypes.func.isRequired,
    job: PropTypes.shape({
      json: PropTypes.string.isRequired
    }),
    jobActionDialog: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.renderBreadcrumbStates = this.renderBreadcrumbStates.bind(this);
    this.state = { currentTab: "runHistory" };
  }

  renderBreadcrumbStates(item) {
    const status = Util.findNestedPropertyInObject(
      item,
      "jobRuns.longestRunningActiveRun.tasks.longestRunningTask.status"
    );

    let schedule = null;
    if (
      item.schedules &&
      item.schedules.nodes.length &&
      item.schedules.nodes[0].enabled
    ) {
      schedule = item.schedules.nodes[0];
    }

    return [
      schedule ? <ItemSchedule key="schedule" schedule={schedule} /> : null,
      status ? <ItemStatus key="status" status={status} /> : null
    ];
  }

  getActions() {
    const job = this.props.job;

    const customActionHandlers = {
      edit: this.props.handleEditButtonClick,
      delete: this.props.handleDestroyButtonClick
    };

    return jobsMenu(job, customActionHandlers);
  }

  render() {
    if (this.props.params.taskID) {
      return this.props.children;
    }

    const { job, params } = this.props;
    const setTab = (currentTab: string) => () => {
      this.setState({ currentTab });
    };

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          breadcrumbs={
            <Breadcrumbs
              jobPath={job.path}
              jobName={job.name}
              jobInfo={this.renderBreadcrumbStates(job)}
            />
          }
          tabs={[
            {
              label: i18nMark("Run History"),
              callback: setTab("runHistory"),
              isActive: this.state.currentTab === "runHistory"
            },
            {
              label: i18nMark("Configuration"),
              callback: setTab("configuration"),
              isActive: this.state.currentTab === "configuration"
            }
          ]}
        />

        {this.state.currentTab === "runHistory" ? (
          <JobRunHistoryTable job={job} />
        ) : this.state.currentTab === "configuration" ? (
          <JobConfiguration job={job} />
        ) : null}

        <JobFormModal
          isEdit={true}
          job={JSON.parse(job.json)}
          isOpen={this.props.jobActionDialog === DIALOGS.EDIT}
          closeModal={this.props.closeDialog}
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

export default JobDetailPage;
