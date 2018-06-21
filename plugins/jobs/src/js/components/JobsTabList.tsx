import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import FilterBar from "#SRC/js/components/FilterBar";
// tslint:disable-next-line:no-submodule-imports
import FilterHeadline from "#SRC/js/components/FilterHeadline";

import JobSearchFilter from "./JobSearchFilter";
import JobsTable from "./JobsTable";
import JobsPage from "./JobsPage";
import { JobConnection } from "#PLUGINS/jobs/src/js/types/JobConnection";

interface JobsTabListProps {
  data: JobConnection;
  filter: string;
  modal: JSX.Element;
  handleFilterChange: (searchString: string) => void;
  handleOpenJobFormModal: () => void;
  resetFilter: () => void;
}

export default class JobsTabList extends React.Component<JobsTabListProps> {
  render() {
    const {
      data,
      filter,
      modal,
      handleFilterChange,
      handleOpenJobFormModal,
      resetFilter
    } = this.props;
    const headline = filter ? (
      <FilterHeadline
        onReset={resetFilter}
        name="Job"
        currentLength={data.filteredCount}
        totalLength={data.totalCount}
      />
    ) : null;

    return (
      <JobsPage
        addButton={{
          label: "Create a job",
          onItemSelect: handleOpenJobFormModal
        }}
        namespace={data.namespace}
      >
        <div className="flex-grow">
          {headline}
          <FilterBar>
            <JobSearchFilter onChange={handleFilterChange} value={filter} />
          </FilterBar>
          <JobsTable data={data} />
        </div>
        {modal}
      </JobsPage>
    );
  }
}
