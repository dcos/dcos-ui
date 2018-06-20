import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import FilterBar from "#SRC/js/components/FilterBar";
// tslint:disable-next-line:no-submodule-imports
import FilterHeadline from "#SRC/js/components/FilterHeadline";
// tslint:disable-next-line:no-submodule-imports
import JobTree from "#SRC/js/structs/JobTree";

import JobSearchFilter from "./JobSearchFilter";
import JobsTable from "./JobsTable";
import JobsPage from "./JobsPage";
import { Job } from "#PLUGINS/jobs/src/js/types/Job";

interface JobsTabListProps {
  item: JobTree;
  root: JobTree;
  modal: JSX.Element;
  filteredJobs: Array<JobTree | Job>;
  searchString?: string | null;
  handleFilterChange: (searchString: string) => void;
  handleOpenJobFormModal: () => void;
  resetFilter: () => void;
  filteredCount: number;
  totalCount: number;
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
      filteredCount,
      totalCount
    } = this.props;
    const headline =
      filteredCount < totalCount ? (
        <FilterHeadline
          onReset={resetFilter}
          name="Jobs"
          currentLength={filteredJobs.length}
          totalLength={item.length}
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
