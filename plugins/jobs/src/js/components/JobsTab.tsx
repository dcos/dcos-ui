import * as React from "react";

import JobFormModalContainer from "../JobFormModalContainer";
import JobTree from "#SRC/js/structs/JobTree";
// tslint:disable-next-line:no-submodule-imports

import JobsTabList from "./JobsTabList";
import JobsTabEmpty from "./JobsTabEmpty";
import { Job } from "#PLUGINS/jobs/src/js/types/Job";

interface JobsTabsProps {
  item: JobTree;
  root: JobTree;
  filteredJobs: Array<JobTree | Job>;
  searchString?: string | null;
  handleFilterChange: (searchString: string) => void;
  resetFilter: () => void;
  filteredCount: number;
  totalCount: number;
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
      filteredCount,
      totalCount
    } = this.props;

    const modal = (
      <JobFormModalContainer
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
          filteredCount={filteredCount}
          totalCount={totalCount}
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
