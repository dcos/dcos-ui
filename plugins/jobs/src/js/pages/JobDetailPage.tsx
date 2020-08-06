import { i18nMark } from "@lingui/react";
import * as React from "react";
import { routerShape } from "react-router";
import Page from "#SRC/js/components/Page";
import JobFormModal from "../components/JobsFormModal";
import JobConfiguration from "./JobConfiguration";
import JobRunHistoryTable from "./JobRunHistoryTable";
import ItemSchedule from "../components/breadcrumbs/Schedule";
import ItemStatus from "../components/breadcrumbs/Status";
import Breadcrumbs from "../components/Breadcrumbs";
import JobDelete from "../JobDelete";
import jobsMenu from "../jobsMenu";

class JobDetailPage extends React.Component<
  {
    job: {
      id: string;
      path?: string[];
      name?: string;
      json: string;
    };
    params: {
      id: string;
      taskID: string;
    };
  },
  { currentTab: string; currentDialog: null | "edit" | "destroy" }
> {
  static contextTypes = { router: routerShape };
  state = {
    currentDialog: null,
    currentTab: "runHistory",
  };

  onJobDeleteSuccess() {
    this.closeDialog();
    this.context.router.push("/jobs/overview");
  }

  renderBreadcrumbStates(item) {
    const schedule = item.schedules?.nodes?.find((n) => n.enabled);
    const status =
      item?.jobRuns?.longestRunningTask?.tasks?.longestRunningTask?.status;

    return [
      schedule ? <ItemSchedule key="schedule" schedule={schedule} /> : null,
      status ? <ItemStatus key="status" status={status} /> : null,
    ];
  }

  closeDialog() {
    this.setState({ currentDialog: null });
  }

  render() {
    if (this.props.params.taskID) {
      return this.props.children;
    }

    const jobDeleteSuccess = () => this.onJobDeleteSuccess();
    const closeDialog = () => this.closeDialog();
    const { job, params } = this.props;
    const setTab = (currentTab: string) => () => {
      this.setState({ currentTab });
    };

    return (
      <Page>
        <Page.Header
          actions={jobsMenu(this.props.job, {
            edit: () => void this.setState({ currentDialog: "edit" }),
            delete: () => void this.setState({ currentDialog: "destroy" }),
          })}
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
              isActive: this.state.currentTab === "runHistory",
            },
            {
              label: i18nMark("Configuration"),
              callback: setTab("configuration"),
              isActive: this.state.currentTab === "configuration",
            },
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
          isOpen={this.state.currentDialog === "edit"}
          closeModal={closeDialog}
        />
        <JobDelete
          jobId={params.id}
          open={this.state.currentDialog === "destroy"}
          onSuccess={jobDeleteSuccess}
          onClose={closeDialog}
        />
      </Page>
    );
  }
}

export default JobDetailPage;
