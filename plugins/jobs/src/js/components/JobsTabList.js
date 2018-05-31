import React, { Component } from "react";

// everything that is references as #ALIAS/something has to be refactored once our DI system is in place
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";

import JobSearchFilter from "./JobSearchFilter";
import JobsTable from "./JobsTable";
import JobsPage from "./JobsPage";

export default class JobsTabList extends Component {
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
