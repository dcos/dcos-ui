import * as React from "react";

interface IJobsTabsProps {
  item: any;
  root: any;
  isLoading: any;
  filteredJobs: any;
  searchString: any;
  handleFilterChange: any;
  resetFilter: any;
  hasFilterApplied: any;
}

declare class JobsTab extends React.Component<IJobsTabsProps, {}> {
    constructor();
    render():any
}