import mixin from "reactjs-mixin";
import { Link } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import AddRepositoryFormModal
  from "../../components/modals/AddRepositoryFormModal";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import FilterBar from "../../components/FilterBar";
import FilterInputText from "../../components/FilterInputText";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import RepositoriesTable from "../../components/RepositoriesTable";
import RequestErrorMsg from "../../components/RequestErrorMsg";

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
      iconID="gear"
      breadcrumbs={crumbs}
      addButton={addButton}
    />
  );
};

const METHODS_TO_BIND = [
  "handleSearchStringChange",
  "handleCloseAddRepository",
  "handleOpenAddRepository"
];

class RepositoriesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      addRepositoryModalOpen: false,
      hasError: false,
      isLoading: true,
      searchString: ""
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: ["repositoriesSuccess", "repositoriesError"],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchRepositories();
  }

  handleCloseAddRepository() {
    this.setState({ addRepositoryModalOpen: false });
  }

  handleOpenAddRepository() {
    this.setState({ addRepositoryModalOpen: true });
  }

  onCosmosPackagesStoreRepositoriesError() {
    this.setState({ hasError: true });
  }

  onCosmosPackagesStoreRepositoriesSuccess() {
    this.setState({ hasError: false, isLoading: false });
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getContent() {
    const {
      addRepositoryModalOpen,
      hasError,
      isLoading,
      searchString
    } = this.state;

    if (hasError) {
      return this.getErrorScreen();
    }

    if (isLoading) {
      return this.getLoadingScreen();
    }

    const repositories = CosmosPackagesStore.getRepositories().filterItemsByText(
      searchString
    );

    return (
      <div>
        <FilterBar>
          <FilterInputText
            className="flush-bottom"
            placeholder="Search"
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
          />
        </FilterBar>
        <RepositoriesTable repositories={repositories} filter={searchString} />
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
      <Page>
        <Page.Header
          addButton={{
            onItemSelect: this.handleOpenAddRepository,
            label: "Add Repository"
          }}
          breadcrumbs={<RepositoriesBreadcrumbs />}
        />
        {this.getContent()}
      </Page>
    );
  }
}

RepositoriesTab.routeConfig = {
  label: "Package Repositories",
  matches: /^\/settings\/repositories/
};

module.exports = RepositoriesTab;
