import * as React from "react";
import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";

import JobsOverviewTable from "./JobsOverviewTable";
import JobsPage from "./JobsPage";
import JobFormModal from "./NewJobsFormModal";
import { JobConnection } from "../types/JobConnection";

interface JobsOverviewListProps {
  data: JobConnection;
  filter: string;
  handleFilterChange: (filter: string) => void;
  i18n: any;
}
interface JobsOverviewListState {
  isJobFormModalOpen: boolean;
}

class JobsOverviewList extends React.Component<
  JobsOverviewListProps,
  JobsOverviewListState
> {
  constructor(props: Readonly<JobsOverviewListProps>) {
    super(props);

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
    const { data, filter, i18n } = this.props;
    // L10NTODO: Pluralize
    // We should pluralize FilterHeadline name here using lingui macro instead of
    // doing it manually in FilterHeadline
    const headline = filter ? (
      <FilterHeadline
        onReset={this.resetFilter}
        name={i18n._(t`Job`)}
        currentLength={data.filteredCount}
        totalLength={data.totalCount}
      />
    ) : null;

    return (
      <JobsPage
        addButton={{
          label: <Trans render="span">Create a job</Trans>,
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
              placeholder={i18n._(t`Search`)}
              searchString={this.props.filter || ""}
            />
          </FilterBar>
          <JobsOverviewTable data={data} />
        </div>
        <JobFormModal
          isOpen={this.state.isJobFormModalOpen}
          closeModal={this.handleCloseJobFormModal}
        />
      </JobsPage>
    );
  }
}

export default withI18n()(JobsOverviewList);
