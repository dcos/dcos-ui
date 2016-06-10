import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AddRepositoryFormModal from '../../components/modals/AddRepositoryFormModal';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import FilterBar from '../../components/FilterBar';
import FilterInputText from '../../components/FilterInputText';
import RepositoriesTable from '../../components/RepositoriesTable';
import RequestErrorMsg from '../../components/RequestErrorMsg';

const METHODS_TO_BIND = [
  'handleSearchStringChange',
  'handleCloseAddRepository',
  'handleOpenAddRepository'
];

class RepositoriesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      addRepositoryModalOpen: false,
      hasError: false,
      isLoading: true
    };

    this.store_listeners = [
      {
        name: 'cosmosPackages',
        events: ['repositoriesSuccess', 'repositoriesError'],
        unmountWhen: function () {
          return true;
        },
        listenAlways: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchRepositories();
  }

  handleCloseAddRepository() {
    this.setState({addRepositoryModalOpen: false});
  }

  handleOpenAddRepository() {
    this.setState({addRepositoryModalOpen: true});
  }

  onCosmosPackagesStoreRepositoriesError() {
    this.setState({hasError: true});
  }

  onCosmosPackagesStoreRepositoriesSuccess() {
    this.setState({hasError: false, isLoading: false});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getLoadingScreen() {
    return (
      <div className="container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  render() {
    let {
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

    let repositories = CosmosPackagesStore.getRepositories()
      .filterItemsByText(searchString);

    return (
      <div>
        <FilterBar rightAlignLastNChildren={1}>
          <FilterInputText
            className="flush-bottom"
            placeholder="Search"
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={true} />
          <button
            className="button button-success"
            onClick={this.handleOpenAddRepository}>
            Add Repository
          </button>
        </FilterBar>
        <RepositoriesTable repositories={repositories} filter={searchString} />
        <AddRepositoryFormModal
          numberOfRepositories={repositories.getItems().length}
          open={addRepositoryModalOpen}
          onClose={this.handleCloseAddRepository} />
      </div>
    );
  }
}

module.exports = RepositoriesTab;
