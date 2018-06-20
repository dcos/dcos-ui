import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import FilterBar from "#SRC/js/components/FilterBar";
// tslint:disable-next-line:no-submodule-imports
import FilterHeadline from "#SRC/js/components/FilterHeadline";
// tslint:disable-next-line:no-submodule-imports
import JobTree from "#SRC/js/structs/JobTree";
// tslint:disable-next-line:no-submodule-imports
import Job from "#SRC/js/structs/Job";

import JobSearchFilter from "./JobSearchFilter";
import JobsTable from "./JobsTable";
import JobsPage from "./JobsPage";

interface JobsTabListProps {
  item: JobTree;
  root: JobTree;
  modal: JSX.Element;
  searchString: string;
  filteredJobs: Array<JobTree | Job>;
  handleFilterChange: (searchString: string) => void;
  handleOpenJobFormModal: () => void;
  resetFilter: () => void;
  hasFilterApplied: boolean;
}

export default class JobsTabList extends React.Component<JobsTabListProps> {
  render() {
    const {
      item,
      root,
      modal,
      filteredJobs,
      searchString,
      handleFilterChange,
      handleOpenJobFormModal,
      resetFilter,
      hasFilterApplied
    } = this.props;
    const headline = hasFilterApplied ? (
      <FilterHeadline
        onReset={resetFilter}
        name="Jobs"
        currentLength={filteredJobs.length}
        totalLength={item.getItems().length}
      />
    ) : null;

    return (
      <JobsPage
        addButton={{
          label: "Create a job",
          onItemSelect: handleOpenJobFormModal
        }}
        root={root}
        item={item}
      >
        <div className="flex-grow">
          {headline}
          <FilterBar>
            <JobSearchFilter
              onChange={handleFilterChange}
              value={searchString}
            />
          </FilterBar>
          <JobsTable jobs={filteredJobs} />
        </div>
        {modal}
      </JobsPage>
    );
  }
}
