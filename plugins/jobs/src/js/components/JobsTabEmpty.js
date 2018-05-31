import React, { Component } from "react";

// everything that is references as #ALIAS/something has to be refactored once our DI system is in place
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

import JobsPage from "./JobsPage";

export default class JobsTabEmpty extends Component {
  render() {
    const { handleOpenJobFormModal, modal, root } = this.props;

    return (
      <JobsPage root={root}>
        <AlertPanel>
          <AlertPanelHeader>No active jobs</AlertPanelHeader>
          <p className="tall">
            Create both one-off or scheduled jobs to perform tasks at a
            predefined interval.
          </p>
          <div className="button-collection flush-bottom">
            <button
              className="button button-primary"
              onClick={handleOpenJobFormModal}
            >
              Create a Job
            </button>
          </div>
        </AlertPanel>
        {modal}
      </JobsPage>
    );
  }
}
