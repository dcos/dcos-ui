import { Trans } from "@lingui/macro";
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
  constructor(props: Readonly<JobsOverviewEmptyProps>) {
    super(props);

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
          <AlertPanelHeader>
            <Trans>No active jobs</Trans>
          </AlertPanelHeader>
          <Trans render="p" className="tall">
            Create both one-off or scheduled jobs to perform tasks at a
            predefined interval.
          </Trans>
          <div className="button-collection flush-bottom">
            <button
              className="button button-primary"
              onClick={this.handleOpenJobFormModal}
            >
              <Trans>Create a Job</Trans>
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
