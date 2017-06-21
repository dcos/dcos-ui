import mixin from "reactjs-mixin";
import { Hooks } from "PluginSDK";
import { Link, routerShape } from "react-router";
import { MountService } from "foundation-ui";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import AlertPanel from "../../components/AlertPanel";
import AlertPanelHeader from "../../components/AlertPanelHeader";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import CosmosErrorMessage from "../../components/CosmosErrorMessage";
import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import CreateServiceModalUniversePanelOption
  from "../../components/CreateServiceModalUniversePanelOption";
import defaultServiceImage
  from "../../../../plugins/services/src/img/icon-service-default-medium@2x.png";
import DisplayPackagesTable from "../../components/DisplayPackagesTable";
import FilterInputText from "../../components/FilterInputText";
import Image from "../../components/Image";
import InstallPackageModal from "../../components/modals/InstallPackageModal";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import Panel from "../../components/Panel";
import StringUtil from "../../utils/StringUtil";

const PackagesBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Packages">
      <BreadcrumbTextContent>
        <Link to="/universe/packages">Packages</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="packages" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = ["handleInstallModalClose", "handleSearchStringChange"];

const shouldRenderUniverseOption = Hooks.applyFilter(
  "hasCapability",
  true,
  "packageAPI"
);

if (shouldRenderUniverseOption) {
  MountService.MountService.registerComponent(
    CreateServiceModalUniversePanelOption,
    "CreateService:ServicePicker:GridOptions",
    0
  );
}

class PackagesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      errorMessage: false,
      installModalPackage: null,
      isLoading: true,
      searchString: ""
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: ["availableError", "availableSuccess"],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchAvailablePackages();
  }

  onCosmosPackagesStoreAvailableError(errorMessage) {
    this.setState({ errorMessage });
  }

  onCosmosPackagesStoreAvailableSuccess() {
    this.setState({ errorMessage: false, isLoading: false });
  }

  handleDetailOpen(cosmosPackage, event) {
    event.stopPropagation();
    this.context.router.push({
      pathname: `/universe/packages/${cosmosPackage.getName()}`,
      query: {
        version: cosmosPackage.getCurrentVersion()
      }
    });
  }

  handleInstallModalClose() {
    this.setState({ installModalPackage: null });
  }

  handleInstallModalOpen(cosmosPackage, event) {
    event.stopPropagation();
    this.setState({ installModalPackage: cosmosPackage });
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
  }

  getErrorScreen() {
    const { errorMessage } = this.state;

    return (
      <AlertPanel>
        <AlertPanelHeader>An Error Occurred</AlertPanelHeader>
        <CosmosErrorMessage error={errorMessage} flushBottom={true} />
      </AlertPanel>
    );
  }

  getButton(cosmosPackage) {
    return (
      <button
        className="button button-success"
        onClick={this.handleInstallModalOpen.bind(this, cosmosPackage)}
      >
        Install Package
      </button>
    );
  }

  getIcon(cosmosPackage) {
    return (
      <div className="icon icon-jumbo icon-image-container icon-app-container icon-default-white">
        <Image
          fallbackSrc={defaultServiceImage}
          src={cosmosPackage.getIcons()["icon-medium"]}
        />
      </div>
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getSelectedPackages(packages) {
    const { searchString } = this.state;
    if (searchString) {
      return null;
    }

    return packages.getItems().map((cosmosPackage, index) => {
      return (
        <div
          className="panel-grid-item column-12 column-small-6 column-medium-4 column-large-3"
          key={index}
        >
          <Panel
            className="clickable"
            contentClass="horizontal-center"
            footer={this.getButton(cosmosPackage)}
            footerClass="horizontal-center"
            onClick={this.handleDetailOpen.bind(this, cosmosPackage)}
          >
            {this.getIcon(cosmosPackage)}
            <div className="h2 short">
              {cosmosPackage.getName()}
            </div>
            <p className="flush">
              {cosmosPackage.getCurrentVersion()}
            </p>
          </Panel>
        </div>
      );
    });
  }

  getTitle(title) {
    return <h4>{title}</h4>;
  }

  getSelectedPackagesGrid(packages) {
    if (this.state.searchString) {
      return null;
    }

    return (
      <div className="clearfix">
        {this.getTitle("Selected Packages", true)}
        <div className="pod pod-short flush-right flush-left">
          <div className="panel-grid row">
            {this.getSelectedPackages(packages)}
          </div>
        </div>
      </div>
    );
  }

  getPackagesTable(packages) {
    let title = "Community Packages";

    if (this.state.searchString) {
      const foundPackagesLength = packages.getItems().length;
      const packagesWord = StringUtil.pluralize("package", foundPackagesLength);

      title = `${packages.getItems().length} ${packagesWord} found`;
    }

    return (
      <div>
        {this.getTitle(title, false)}
        <DisplayPackagesTable
          onDeploy={this.handleInstallModalOpen.bind(this)}
          onDetailOpen={this.handleDetailOpen.bind(this)}
          packages={packages}
        />
      </div>
    );
  }

  render() {
    const { state } = this;
    let content, packageName, packageVersion;

    if (state.errorMessage) {
      content = this.getErrorScreen();
    } else if (state.isLoading) {
      content = this.getLoadingScreen();
    } else {
      if (state.installModalPackage) {
        packageName = state.installModalPackage.getName();
        packageVersion = state.installModalPackage.getCurrentVersion();
      }

      const packages = CosmosPackagesStore.getAvailablePackages();
      const splitPackages = packages.getSelectedAndNonSelectedPackages();

      let tablePackages = splitPackages.nonSelectedPackages;
      const gridPackages = splitPackages.selectedPackages;

      if (state.searchString) {
        tablePackages = packages.filterItemsByText(state.searchString);
      }

      content = (
        <div>
          <div className="control-group form-group flex-no-shrink flex-align-right flush-bottom">
            <FilterInputText
              className="flex-grow"
              placeholder="Search"
              searchString={state.searchString}
              handleFilterChange={this.handleSearchStringChange}
            />
          </div>
          {this.getSelectedPackagesGrid(gridPackages)}
          {this.getPackagesTable(tablePackages)}
          <InstallPackageModal
            open={!!state.installModalPackage}
            packageName={packageName}
            packageVersion={packageVersion}
            onClose={this.handleInstallModalClose}
          />
        </div>
      );
    }

    return (
      <Page>
        <Page.Header breadcrumbs={<PackagesBreadcrumbs />} />
        {content}
      </Page>
    );
  }
}

PackagesTab.contextTypes = {
  router: routerShape
};

PackagesTab.routeConfig = {
  label: "Packages",
  matches: /^\/universe\/packages/
};

module.exports = PackagesTab;
