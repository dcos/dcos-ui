import * as React from "react";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

import JobsPage from "./JobsPage";
import JobCreateEditFormModal from "../JobCreateEditFormModal";

interface JobsOverviewEmptyProps {
  jobPath?: string[];
}
interface JobsOverviewEmptyState {
  isJobFormModalOpen: boolean;
}
export default class JobsOverviewEmpty extends React.Component<
  JobsOverviewEmptyProps,
  JobsOverviewEmptyState
> {
  constructor() {
    super(...arguments);

    this.state = {
      isJobFormModalOpen: false
    };

    this.handleCloseJobFormModal = this.handleCloseJobFormModal.bind(this);
    this.handleOpenJobFormModal = this.handleOpenJobFormModal.bind(this);
  }

  handleCloseJobFormModal() {
    this.setState({ isJobFormModalOpen: false });
  }

  handleOpenJobFormModal() {
    this.setState({ isJobFormModalOpen: true });
  }

  render() {
    const { jobPath } = this.props;

    return (
      <JobsPage jobPath={jobPath}>
        <AlertPanel>
          <AlertPanelHeader>No active jobs</AlertPanelHeader>
          <p className="tall">
            Create both one-off or scheduled jobs to perform tasks at a
            predefined interval.
          </p>
          <div className="button-collection flush-bottom">
            <button
              className="button button-primary"
              onClick={this.handleOpenJobFormModal}
            >
              Create a Job
            </button>
          </div>
        </AlertPanel>
        <JobCreateEditFormModal
          open={this.state.isJobFormModalOpen}
          onClose={this.handleCloseJobFormModal}
        />
      </JobsPage>
    );
  }
}
