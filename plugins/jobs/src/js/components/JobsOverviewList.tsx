import * as React from "react";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";

import JobsOverviewTable from "./JobsOverviewTable";
import JobsPage from "./JobsPage";
import JobCreateEditFormModal from "../JobCreateEditFormModal";
import { JobConnection } from "../types/JobConnection";

interface JobsOverviewListProps {
  data: JobConnection;
  filter: string;
  handleFilterChange: (filter: string) => void;
}
interface JobsOverviewListState {
  isJobFormModalOpen: boolean;
}

export default class JobsOverviewList extends React.Component<
  JobsOverviewListProps,
  JobsOverviewListState
> {
  constructor() {
    super(...arguments);

    this.state = {
      isJobFormModalOpen: false
    };

    this.handleCloseJobFormModal = this.handleCloseJobFormModal.bind(this);
    this.handleOpenJobFormModal = this.handleOpenJobFormModal.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
  }

  handleCloseJobFormModal() {
    this.setState({ isJobFormModalOpen: false });
  }

  handleOpenJobFormModal() {
    this.setState({ isJobFormModalOpen: true });
  }

  handleFilterChange(filter: string) {
    this.props.handleFilterChange(filter);
  }

  resetFilter() {
    this.props.handleFilterChange("");
  }

  render() {
    const { data, filter } = this.props;
    const headline = filter ? (
      <FilterHeadline
        onReset={this.resetFilter}
        name="Jobs"
        currentLength={data.filteredCount}
        totalLength={data.totalCount}
      />
    ) : null;

    return (
      <JobsPage
        addButton={{
          label: "Create a job",
          onItemSelect: this.handleOpenJobFormModal
        }}
        jobPath={data.path}
      >
        <div className="flex-grow">
          {headline}
          <FilterBar>
            <FilterInputText
              className="flush-bottom"
              handleFilterChange={this.handleFilterChange}
              placeholder="Search"
              searchString={this.props.filter || ""}
            />
          </FilterBar>
          <JobsOverviewTable data={data} />
        </div>
        <JobCreateEditFormModal
          open={this.state.isJobFormModalOpen}
          onClose={this.handleCloseJobFormModal}
        />
      </JobsPage>
    );
  }
}
