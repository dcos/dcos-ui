import { Link } from "react-router";
import React from "react";

import AddRepositoryFormModal
  from "#SRC/js/components/modals/AddRepositoryFormModal";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterInputText from "#SRC/js/components/FilterInputText";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RepositoriesTable from "#SRC/js/components/RepositoriesTable";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

const RepositoriesBreadcrumbs = addButton => {
  const crumbs = [
    <Breadcrumb key={-1} title="Repositories">
      <BreadcrumbTextContent>
        <Link to="/settings/repositories">Package Repositories</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID="settings"
      breadcrumbs={crumbs}
      addButton={addButton}
    />
  );
};

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
        <AddRepositoryFormModal
          numberOfRepositories={repositories.getItems().length}
          open={addRepositoryModalOpen}
          onClose={this.handleCloseAddRepository}
        />
      </div>
    );
  }

  render() {
    return (
      <RepositoriesTabUI.Page
        addButton={{
          onItemSelect: this.handleOpenAddRepository,
          label: "Add Repository"
        }}
      >
        {this.getContent()}
      </RepositoriesTabUI.Page>
    );
  }
}

RepositoriesTabUI.Loading = () => {
  return (
    <RepositoriesTabUI.Page>
      <Loader />
    </RepositoriesTabUI.Page>
  );
};

RepositoriesTabUI.Error = () => {
  return (
    <RepositoriesTabUI.Page>
      <RequestErrorMsg />
    </RepositoriesTabUI.Page>
  );
};

RepositoriesTabUI.Page = ({ addButton, children }) => {
  return (
    <Page>
      <Page.Header
        addButton={addButton}
        breadcrumbs={<RepositoriesBreadcrumbs />}
      />
      {children}
    </Page>
  );
};
