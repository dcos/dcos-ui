import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import AlertPanel from "#SRC/js/components/AlertPanel";
// tslint:disable-next-line:no-submodule-imports
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
// tslint:disable-next-line:no-submodule-imports
import JobTree from "#SRC/js/structs/JobTree";

import JobsPage from "./JobsPage";

interface JobsTabEmptyProps {
  handleOpenJobFormModal: () => void;
  modal: JSX.Element;
  root: JobTree;
}
export default class JobsTabEmpty extends React.Component<JobsTabEmptyProps> {
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
