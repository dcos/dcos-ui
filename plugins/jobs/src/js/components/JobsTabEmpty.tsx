import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import AlertPanel from "#SRC/js/components/AlertPanel";
// tslint:disable-next-line:no-submodule-imports
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

import JobsPage from "./JobsPage";

interface JobsTabEmptyProps {
  handleOpenJobFormModal: () => void;
  modal: JSX.Element;
  namespace?: string[];
}
export default class JobsTabEmpty extends React.Component<JobsTabEmptyProps> {
  render() {
    const { handleOpenJobFormModal, modal, namespace } = this.props;

    return (
      <JobsPage namespace={namespace}>
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
