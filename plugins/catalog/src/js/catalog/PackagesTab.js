import classNames from "classnames";
import mixin from "reactjs-mixin";
import { Hooks } from "PluginSDK";
import { Link, routerShape } from "react-router";
import { MountService } from "foundation-ui";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Badge } from "@dcos/ui-kit";

import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import CosmosErrorMessage from "#SRC/js/components/CosmosErrorMessage";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import CreateServiceModalCatalogPanelOption
  from "#SRC/js/components/CreateServiceModalCatalogPanelOption";
import FilterInputText from "#SRC/js/components/FilterInputText";
import Image from "#SRC/js/components/Image";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import StringUtil from "#SRC/js/utils/StringUtil";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import defaultServiceImage
  from "#PLUGINS/services/src/img/icon-service-default-medium@2x.png";

import CatalogPackageOption from "./CatalogPackageOption";

const PackagesBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Catalog">
      <BreadcrumbTextContent>
        <Link to="/catalog/packages">Catalog</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="catalog" breadcrumbs={crumbs} />;
};

const PackagesEmptyState = () => {
  return (
    <AlertPanel>
      <AlertPanelHeader>No package repositories</AlertPanelHeader>
      <p className="tall">
        You need at least one package repository with some packages to be
        able to install packages. For more {" "}
        <a
          target="_blank"
          href={MetadataStore.buildDocsURI("/administering-clusters/repo")}
        >
          information on repositories
        </a>
        .
      </p>
      <div className="button-collection flush-bottom">
        <Link to="/settings/repositories" className="button button-primary">
          Add Package Repository
        </Link>
      </div>
    </AlertPanel>
  );
};

const METHODS_TO_BIND = ["handleSearchStringChange"];

const shouldRenderCatalogOption = Hooks.applyFilter(
  "hasCapability",
  true,
  "packageAPI"
);

if (shouldRenderCatalogOption) {
  MountService.MountService.registerComponent(
    CreateServiceModalCatalogPanelOption,
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
      pathname: `/catalog/packages/${cosmosPackage.getName()}`,
      query: {
        version: cosmosPackage.getVersion()
      }
    });
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

  getIcon(cosmosPackage) {
    return (
      <div className="icon icon-jumbo icon-image-container icon-app-container icon-app-container--borderless icon-default-white">
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

  getPackageGrid(packages) {
    return packages.getItems().map((cosmosPackage, index) => {
      return (
        <CatalogPackageOption
          image={this.getIcon(cosmosPackage)}
          key={index}
          label={this.getPackageOptionBadge(cosmosPackage)}
          onOptionSelect={this.handleDetailOpen.bind(this, cosmosPackage)}
        >
          <div className="h3 flush">
            {cosmosPackage.getName()}
          </div>
          <small className="flush">
            {cosmosPackage.getVersion()}
          </small>
        </CatalogPackageOption>
      );
    });
  }

  getPackageOptionBadge(cosmosPackage) {
    const isCertified = cosmosPackage.isCertified();
    const copy = isCertified ? "Certified" : "Community";
    const appearance = isCertified ? "primary" : "default";

    return <Badge appearance={appearance}>{copy}</Badge>;
  }

  getCertifiedPackagesGrid(packages) {
    if (this.state.searchString || packages.getItems().length === 0) {
      return null;
    }

    return (
      <div className="pod flush-top flush-horizontal clearfix">
        <h1 className="short flush-top">Certified</h1>
        <p className="tall flush-top">
          Certified packages are verified by Mesosphere for interoperability with DC/OS.
        </p>
        <div className="panel-grid row">
          {this.getPackageGrid(packages)}
        </div>
      </div>
    );
  }

  getCommunityPackagesGrid(packages) {
    if (packages.getItems().length === 0) {
      return null;
    }

    let subtitle = (
      <p className="tall flush-top">
        Community packages are unverified and unreviewed content from the community.
      </p>
    );
    let title = "Community";
    const isSearchActive = this.state.searchString !== "";
    const titleClasses = classNames("flush-top", {
      short: !isSearchActive,
      tall: isSearchActive
    });

    if (isSearchActive) {
      const foundPackagesLength = packages.getItems().length;
      const packagesWord = StringUtil.pluralize("service", foundPackagesLength);

      subtitle = null;
      title = `${packages.getItems().length} ${packagesWord} found`;
    }

    return (
      <div className="clearfix">
        <h1 className={titleClasses}>{title}</h1>
        {subtitle}
        <div className="panel-grid row">
          {this.getPackageGrid(packages)}
        </div>
      </div>
    );
  }

  render() {
    const { state } = this;
    let content;

    if (state.errorMessage) {
      content = this.getErrorScreen();
    } else if (state.isLoading) {
      content = this.getLoadingScreen();
    } else {
      const packages = CosmosPackagesStore.getAvailablePackages();

      if (packages.getItems() == null || packages.getItems().length === 0) {
        content = <PackagesEmptyState />;
      } else {
        const splitPackages = packages.getSelectedAndNonSelectedPackages();

        let communityPackages = splitPackages.nonSelectedPackages;
        const selectedPackages = splitPackages.selectedPackages;

        if (state.searchString) {
          communityPackages = packages.filterItemsByText(state.searchString);
        }

        content = (
          <div className="container">
            <div className="pod flush-horizontal flush-top">
              <FieldAutofocus>
                <FilterInputText
                  className="flex-grow"
                  placeholder="Search catalog"
                  searchString={state.searchString}
                  handleFilterChange={this.handleSearchStringChange}
                />
              </FieldAutofocus>
            </div>
            {this.getCertifiedPackagesGrid(selectedPackages)}
            {this.getCommunityPackagesGrid(communityPackages)}
          </div>
        );
      }
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

module.exports = PackagesTab;
