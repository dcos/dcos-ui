import React, { Component } from "react";

import AlertPanel from "../../components/AlertPanel";
import AlertPanelHeader from "../../components/AlertPanelHeader";
import FilterBar from "../../components/FilterBar";
import FilterHeadline from "../../components/FilterHeadline";
import JobsBreadcrumbs from "../../components/breadcrumbs/JobsBreadcrumbs";
import JobsTable from "./JobsTable";
import JobSearchFilter from "../../components/JobSearchFilter";
import JobFormModal from "../../components/modals/JobFormModal";
import JobTree from "../../structs/JobTree";
import Loader from "../../components/Loader";
import Page from "../../components/Page";

const METHODS_TO_BIND = ["handleCloseJobFormModal", "handleOpenJobFormModal"];

const ConditionalFilterHeadline = ({
  item,
  filteredJobs,
  hasFilterApplied,
  resetFilter
}) => {
  const jobs = item.getItems();

  if (hasFilterApplied) {
    return (
      <FilterHeadline
        onReset={resetFilter}
        name="Jobs"
        currentLength={filteredJobs.length}
        totalLength={jobs.length}
      />
    );
  }

  return null;
};

const JobsTabLoading = ({ root }) => {
  return (
    <Page>
      <Page.Header breadcrumbs={<JobsBreadcrumbs tree={root} />} />
      <Loader />
    </Page>
  );
};

const JobsTabList = ({
  item,
  root,
  modal,
  filteredJobs,
  searchString,
  handleFilterChange,
  handleOpenJobFormModal,
  resetFilter,
  hasFilterApplied
}) => {
  return (
    <Page>
      <Page.Header
        addButton={{
          label: "Create a job",
          onItemSelect: handleOpenJobFormModal
        }}
        breadcrumbs={<JobsBreadcrumbs tree={root} item={item} />}
      />
      <div className="flex-grow">
        <ConditionalFilterHeadline
          item={item}
          filteredJobs={filteredJobs}
          hasFilterApplied={hasFilterApplied}
          resetFilter={resetFilter}
        />
        <FilterBar>
          <JobSearchFilter onChange={handleFilterChange} value={searchString} />
        </FilterBar>
        <JobsTable jobs={filteredJobs} />
      </div>
      {modal}
    </Page>
  );
};

const JobsTabEmpty = ({ handleOpenJobFormModal, modal, root }) => {
  return (
    <Page>
      <Page.Header breadcrumbs={<JobsBreadcrumbs tree={root} />} />
      <AlertPanel>
        <AlertPanelHeader>No active jobs</AlertPanelHeader>
        <p className="tall">
          Create both one-off or scheduled jobs to perform tasks at a predefined
          interval.
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
    </Page>
  );
};

class JobsTab extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      isJobFormModalOpen: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
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
      isLoading,
      root,
      filteredJobs,
      searchString,
      handleFilterChange,
      resetFilter,
      hasFilterApplied
    } = this.props;

    const modal = (
      <JobFormModal
        open={this.state.isJobFormModalOpen}
        onClose={this.handleCloseJobFormModal}
      />
    );

    // Render loading screen
    if (!isLoading) {
      return <JobsTabLoading root={root} />;
    }

    // render list view
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

    // Render empty panel
    return (
      <JobsTabEmpty
        handleOpenJobFormModal={this.handleOpenJobFormModal}
        modal={modal}
        root={root}
      />
    );
  }
}

module.exports = JobsTab;
