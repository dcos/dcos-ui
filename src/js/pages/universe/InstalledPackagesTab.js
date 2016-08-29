import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import FilterInputText from '../../components/FilterInputText';
import PackagesTable from '../../components/PackagesTable';
import RequestErrorMsg from '../../components/RequestErrorMsg';

const METHODS_TO_BIND = [
  'handleSearchStringChange'
];

class InstalledPackagesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      hasError: false,
      isLoading: true,
      searchString: ''
    };

    this.store_listeners = [
      {
        name: 'cosmosPackages',
        events: ['installedError', 'installedSuccess'],
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchInstalledPackages();
  }

  onCosmosPackagesStoreInstalledError() {
    this.setState({hasError: true});
  }

  onCosmosPackagesStoreInstalledSuccess() {
    this.setState({hasError: false, isLoading: false});
  }

  handleSearchStringChange(searchString = '') {
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
    let {hasError, isLoading, searchString} = this.state;

    if (hasError) {
      return this.getErrorScreen();
    }

    if (isLoading) {
      return this.getLoadingScreen();
    }

    let packages = CosmosPackagesStore.getInstalledPackages()
      .filterItemsByText(searchString);

    return (
      <div>
        <div className="control-group form-group flex-no-shrink flex-align-right flush-bottom">
          <FilterInputText
            className="flex-grow"
            placeholder="Search"
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={true} />
        </div>
        <PackagesTable packages={packages} filter={searchString} />
      </div>
    );
  }
}

module.exports = InstalledPackagesTab;
