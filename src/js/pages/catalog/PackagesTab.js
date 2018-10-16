import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
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
import AlertPanel from "../../components/AlertPanel";
import AlertPanelHeader from "../../components/AlertPanelHeader";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import CosmosErrorMessage from "../../components/CosmosErrorMessage";
import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import CreateServiceModalCatalogPanelOption from "../../components/CreateServiceModalCatalogPanelOption";
import defaultServiceImage from "../../../../plugins/services/src/img/icon-service-default-medium@2x.png";
import FilterInputText from "../../components/FilterInputText";
import Image from "../../components/Image";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import StringUtil from "../../utils/StringUtil";
import CatalogPackageOption from "./CatalogPackageOption";
import MetadataStore from "../../stores/MetadataStore";

const PackagesBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Catalog">
      <BreadcrumbTextContent>
        <Link to="/catalog/packages">
          <Trans render="span">Catalog</Trans>
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="catalog" breadcrumbs={crumbs} />;
};

const PackagesEmptyState = () => {
  return (
    <AlertPanel>
      <AlertPanelHeader>
        <Trans render="span">No package repositories</Trans>
      </AlertPanelHeader>
      <Trans render="p" className="tall">
        You need at least one package repository with some packages to be able
        to install packages. For more{" "}
        <a
          target="_blank"
          href={MetadataStore.buildDocsURI("/administering-clusters/repo")}
        >
          information on repositories
        </a>
        .
      </Trans>
      <div className="button-collection flush-bottom">
        <Link to="/settings/repositories" className="button button-primary">
          <Trans render="span">Add Package Repository</Trans>
        </Link>
      </div>
    </AlertPanel>
  );
};

const METHODS_TO_BIND = ["handleSearchStringChange", "clearInput"];

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

  clearInput() {
    this.handleSearchStringChange("");
  }

  getErrorScreen() {
    const { errorMessage } = this.state;

    return (
      <AlertPanel>
        <AlertPanelHeader>
          <Trans render="span">An Error Occurred</Trans>
        </AlertPanelHeader>
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
          <div className="h3 flush">{cosmosPackage.getName()}</div>
          <small className="flush">{cosmosPackage.getVersion()}</small>
        </CatalogPackageOption>
      );
    });
  }

  getPackageOptionBadge(cosmosPackage) {
    const isCertified = cosmosPackage.isCertified();
    const copy = isCertified ? i18nMark("Certified") : i18nMark("Community");
    const appearance = isCertified ? "primary" : "default";

    return <Trans id={copy} render={<Badge appearance={appearance} />} />;
  }

  getCertifiedPackagesGrid(packages) {
    if (this.state.searchString || packages.getItems().length === 0) {
      return null;
    }

    return (
      <div className="pod flush-top flush-horizontal clearfix">
        <Trans render="h1" className="short flush-top">
          Certified
        </Trans>
        <Trans render="p" className="tall flush-top">
          Certified packages are verified by Mesosphere for interoperability
          with DC/OS.
        </Trans>
        <div className="panel-grid row">{this.getPackageGrid(packages)}</div>
      </div>
    );
  }

  getCommunityPackagesGrid(packages) {
    const isSearchActive = this.state.searchString !== "";
    if (!isSearchActive && packages.getItems().length === 0) {
      return null;
    }

    let subtitle = (
      <Trans render="p" className="tall flush-top">
        Community packages are unverified and unreviewed content from the
        community.
      </Trans>
    );
    let title = <Trans render="span">Community</Trans>;
    const titleClasses = classNames("flush-top", {
      short: !isSearchActive,
      tall: isSearchActive
    });

    if (isSearchActive) {
      const foundPackagesLength = packages.getItems().length;
      if (foundPackagesLength < 1) {
        const noResults = (
          <Trans render="span">
            No results were found for your search: "{this.state.searchString}"
          </Trans>
        );

        return (
          <Trans render="div" className="clearfix">
            {noResults} (<a className="clickable" onClick={this.clearInput}>
              view all
            </a>)
          </Trans>
        );
      }

      // L10NTODO: Pluralize
      const packagesWord = StringUtil.pluralize("service", foundPackagesLength);
      subtitle = null;
      title = (
        <Trans render="span">
          {packages.getItems().length} {packagesWord} found
        </Trans>
      );
    }

    return (
      <div className="clearfix">
        <h1 className={titleClasses}>{title}</h1>
        {subtitle}
        <div className="panel-grid row">{this.getPackageGrid(packages)}</div>
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
