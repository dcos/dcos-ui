import React from "react";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterInputText from "#SRC/js/components/FilterInputText";

import RepositoriesPage from "./RepositoriesPage";
import RepositoriesTable from "./RepositoriesTable";
import RepositoriesAdd from "../RepositoriesAdd";

const METHODS_TO_BIND = ["handleCloseAddRepository", "handleOpenAddRepository"];

export default class RepositoriesTabUI extends React.Component {
  constructor() {
    super();

    this.state = {
      addRepositoryModalOpen: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleCloseAddRepository() {
    this.setState({ addRepositoryModalOpen: false });
  }

  handleOpenAddRepository() {
    this.setState({ addRepositoryModalOpen: true });
  }

  getContent() {
    const { addRepositoryModalOpen } = this.state;

    const { repositories, searchTerm, onSearch } = this.props;

    return (
      <div>
        <FilterBar>
          <FilterInputText
            className="flush-bottom"
            placeholder="Search"
            searchString={searchTerm}
            handleFilterChange={onSearch}
          />
        </FilterBar>
        <RepositoriesTable repositories={repositories} filter={searchTerm} />
        <RepositoriesAdd
          numberOfRepositories={repositories.getItems().length}
          open={addRepositoryModalOpen}
          onClose={this.handleCloseAddRepository}
        />
      </div>
    );
  }

  render() {
    return (
      <RepositoriesPage
        addButton={{
          onItemSelect: this.handleOpenAddRepository,
          label: "Add Repository"
        }}
      >
        {this.getContent()}
      </RepositoriesPage>
    );
  }
}
