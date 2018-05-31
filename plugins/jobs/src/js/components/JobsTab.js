import React, { Component } from "react";

// everything that is references as #ALIAS/something has to be refactored once our DI system is in place
import JobFormModal from "#SRC/js/components/modals/JobFormModal";
import JobTree from "#SRC/js/structs/JobTree";

import JobsTabList from "./JobsTabList";
import JobsTabEmpty from "./JobsTabEmpty";

const METHODS_TO_BIND = ["handleCloseJobFormModal", "handleOpenJobFormModal"];

export default class JobsTab extends Component {
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
