import * as React from "react";

import JobCreateEditFormModal from "../JobCreateEditFormModal";
import JobTree from "#SRC/js/structs/JobTree";
// tslint:disable-next-line:no-submodule-imports
import Job from "#SRC/js/structs/Job";

import JobsTabList from "./JobsTabList";
import JobsTabEmpty from "./JobsTabEmpty";

interface JobsTabsProps {
  item: JobTree;
  root: JobTree;
  filteredJobs: Job[];
  searchString: string;
  handleFilterChange: () => void;
  resetFilter: () => void;
  hasFilterApplied: boolean;
}

interface JobsTabState {
  isJobFormModalOpen: boolean;
}

export default class JobsTab extends React.Component<
  JobsTabsProps,
  JobsTabState
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
    const {
      item,
      root,
      filteredJobs,
      searchString,
      handleFilterChange,
      resetFilter,
      hasFilterApplied
    } = this.props;

    const modal = (
      <JobCreateEditFormModal
        open={this.state.isJobFormModalOpen}
        onClose={this.handleCloseJobFormModal}
      />
    );

    if (item instanceof JobTree && item.getItems().length > 0) {
      return (
        <JobsTabList
          item={item}
          root={root}
          modal={modal}
          filteredJobs={filteredJobs}
          searchString={searchString}
          handleFilterChange={handleFilterChange}
          handleOpenJobFormModal={this.handleOpenJobFormModal}
          resetFilter={resetFilter}
          hasFilterApplied={hasFilterApplied}
        />
      );
    }

    return (
      <JobsTabEmpty
        handleOpenJobFormModal={this.handleOpenJobFormModal}
        modal={modal}
        root={root}
      />
    );
  }
}
