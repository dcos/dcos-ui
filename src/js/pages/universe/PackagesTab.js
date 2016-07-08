import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosErrorMessage from '../../components/CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import FilterInputText from '../../components/FilterInputText';
import InstallPackageModal from '../../components/modals/InstallPackageModal';
import DisplayPackagesTable from '../../components/DisplayPackagesTable';
import Panel from '../../components/Panel';
import StringUtil from '../../utils/StringUtil';

const METHODS_TO_BIND = [
  'handleInstallModalClose',
  'handleSearchStringChange'
];

class PackagesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      errorMessage: false,
      installModalPackage: null,
      isLoading: true
    };

    this.store_listeners = [
      {name: 'cosmosPackages', events: ['availableError', 'availableSuccess']}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchAvailablePackages();
  }

  onCosmosPackagesStoreAvailableError(errorMessage) {
    this.setState({errorMessage});
  }

  onCosmosPackagesStoreAvailableSuccess() {
    this.setState({errorMessage: false, isLoading: false});
  }

  handleDetailOpen(cosmosPackage, event) {
    event.stopPropagation();
    this.context.router.transitionTo(
      'universe-packages-detail',
      {packageName: cosmosPackage.getName()},
      {version: cosmosPackage.getCurrentVersion()}
    );
  }

  handleInstallModalClose() {
    this.setState({installModalPackage: null});
  }

  handleInstallModalOpen(cosmosPackage, event) {
    event.stopPropagation();
    this.setState({installModalPackage: cosmosPackage});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  getErrorScreen() {
    let {errorMessage} = this.state;

    return (
      <CosmosErrorMessage
        error={errorMessage}
        headerClass="h3 text-align-center flush-top inverse" />
    );
  }

  getButton(cosmosPackage) {
    return (
      <button
        className="button button-success"
        onClick={this.handleInstallModalOpen.bind(this, cosmosPackage)}>
        Install Package
      </button>
    );
  }

  getIcon(cosmosPackage) {
    return (
      <div className="icon icon-jumbo icon-image-container icon-app-container icon-default-white">
        <img src={cosmosPackage.getIcons()['icon-medium']} />
      </div>
    );
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

  getSelectedPackages(packages) {
    let {searchString} = this.state;
    if (searchString) {
      return null;
    }

    return packages.getItems().map((cosmosPackage, index) => {
      return (
        <div
          className="grid-item column-mini-6 column-medium-4 column-large-3"
          key={index}>
          <Panel
            className="panel panel-inverse clickable"
            contentClass="panel-content short-bottom tall-top horizontal-center"
            footer={this.getButton(cosmosPackage)}
            footerClass="panel-footer tall-bottom horizontal-center no-border-top flush-top"
            onClick={this.handleDetailOpen.bind(this, cosmosPackage)}>
            {this.getIcon(cosmosPackage)}
            <div className="h2 inverse short">
              {cosmosPackage.getName()}
            </div>
            <p className="inverse flush">
              {cosmosPackage.getCurrentVersion()}
            </p>
          </Panel>
        </div>
      );
    });
  }

  getBorderedTitle(title) {
    return (
      <div className="container-pod container-pod-divider-bottom container-pod-divider-inverse flush-bottom flush-top">
        <h4 className="inverse">{title}</h4>
      </div>
    );
  }

  getSelectedPackagesGrid(packages) {
    if (this.state.searchString) {
      return null;
    }

    return (
      <div className="clearfix">
        {this.getBorderedTitle('Selected Packages', true)}
        <div className="container-pod container-pod-short">
          <div className="grid row">
            {this.getSelectedPackages(packages)}
          </div>
        </div>
      </div>
    );
  }

  getPackagesTable(packages) {
    let title = 'Community Packages';

    if (this.state.searchString) {
      let foundPackagesLength = packages.getItems().length;
      let packagesWord = StringUtil.pluralize('package', foundPackagesLength);

      title = `${packages.getItems().length} ${packagesWord} found`;
    }

    return (
      <div>
        {this.getBorderedTitle(title, false)}
        <DisplayPackagesTable
          onDeploy={this.handleInstallModalOpen.bind(this)}
          onDetailOpen={this.handleDetailOpen.bind(this)}
          packages={packages} />
      </div>
    );
  }

  render() {
    let {state} = this;
    let packageName, packageVersion;

    if (state.errorMessage) {
      return this.getErrorScreen();
    }

    if (state.isLoading) {
      return this.getLoadingScreen();
    }

    if (state.installModalPackage) {
      packageName = state.installModalPackage.getName();
      packageVersion = state.installModalPackage.getCurrentVersion();
    }

    let packages = CosmosPackagesStore.getAvailablePackages();
    let splitPackages = packages.getSelectedAndNonSelectedPackages();

    let tablePackages = splitPackages.nonSelectedPackages;
    let gridPackages = splitPackages.selectedPackages;

    if (state.searchString) {
      tablePackages = packages.filterItemsByText(state.searchString);
    }

    return (
      <div>
        <div className="control-group form-group flex-no-shrink flex-align-right flush-bottom">
          <FilterInputText
            className="flex-grow"
            placeholder="Search"
            searchString={state.searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={true} />
        </div>
        {this.getSelectedPackagesGrid(gridPackages)}
        {this.getPackagesTable(tablePackages)}
        <InstallPackageModal
          open={!!state.installModalPackage}
          packageName={packageName}
          packageVersion={packageVersion}
          onClose={this.handleInstallModalClose}/>
      </div>
    );
  }
}

PackagesTab.contextTypes = {
  router: React.PropTypes.func
};

module.exports = PackagesTab;
