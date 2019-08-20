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
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import FilterBar from "#SRC/js/components/FilterBar";
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

const Filters = {
  all: "all",
  certified: "certified",
  community: "community"
};

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

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Packages}
      breadcrumbs={crumbs}
    />
  );
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

const METHODS_TO_BIND = [
  "handleSearchStringChange",
  "showAll",
  "getFilterButtons",
  "renderNoResults"
];

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

function renderPage(content) {
  return (
    <Page>
      <Page.Header breadcrumbs={<PackagesBreadcrumbs />} />
      {content}
    </Page>
  );
}

class PackagesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      errorMessage: false,
      installModalPackage: null,
      isLoading: true,
      searchString: "",
      searchFilter: Filters.certified
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

  showAll() {
    this.setState({
      searchString: "",
      searchFilter: Filters.all
    });
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
    return (
      <div className="pod flush-top flush-horizontal clearfix">
        <Trans render="h1" className="short flush-top">
          Certified
        </Trans>
        <Trans render="p" className="tall flush-top">
          Certified packages are verified by D2iQ for interoperability with
          DC/OS.
        </Trans>
        <div className="panel-grid row">{this.getPackageGrid(packages)}</div>
      </div>
    );
  }

  getCommunityPackagesGrid(packages) {
    const isSearchActive = this.state.searchString !== "";
    const titleClasses = classNames("flush-top", {
      short: !isSearchActive,
      tall: isSearchActive
    });

    return (
      <div className="clearfix">
        <h1 className={titleClasses}>
          <Trans render="span">Community</Trans>
        </h1>
        <Trans render="p" className="tall flush-top">
          Community packages are unverified and unreviewed content from the
          community.
        </Trans>
        <div className="panel-grid row">{this.getPackageGrid(packages)}</div>
      </div>
    );
  }

  getFilterButtons(selectedLength, communityLength) {
    const numbers = {
      [Filters.all]: selectedLength + communityLength,
      [Filters.certified]: selectedLength,
      [Filters.community]: communityLength
    };

    const currentFilter = this.state.searchFilter;

    const buttons = Object.entries(numbers).map(([filter, number]) => {
      const classSet = classNames("button button-outline", {
        active: filter === currentFilter
      });

      const name = StringUtil.capitalize(filter);
      return (
        <button
          key={filter}
          className={classSet}
          onClick={this.getSearchFilterChangeHandler(filter)}
        >
          <Trans render="b" id={name} />
          <Badge>
            <b>{number}</b>
          </Badge>
        </button>
      );
    });

    return <span className="button-group flush-bottom">{buttons}</span>;
  }

  getSearchFilterChangeHandler(searchFilter) {
    return () => {
      this.setState({ searchFilter });
    };
  }

  renderNoResults() {
    return (
      <Trans render="div" className="clearfix">
        No results were found for your search: "{this.state.searchString}" (
        <a className="clickable" onClick={this.showAll}>
          view all
        </a>
        )
      </Trans>
    );
  }

  render() {
    const { errorMessage, isLoading, searchString, searchFilter } = this.state;

    if (errorMessage) {
      return renderPage(this.getErrorScreen());
    }
    if (isLoading) {
      return renderPage(this.getLoadingScreen());
    }

    const packages = CosmosPackagesStore.getAvailablePackages();
    if (!packages.getItems() || packages.getItems().length === 0) {
      return renderPage(<PackagesEmptyState />);
    }

    const {
      nonSelectedPackages,
      selectedPackages
    } = packages.getSelectedAndNonSelectedPackages();

    const communityPackages = searchString
      ? nonSelectedPackages.filterItemsByText(searchString)
      : nonSelectedPackages;

    const certifiedPackages = searchString
      ? selectedPackages.filterItemsByText(searchString)
      : selectedPackages;

    const hasNoResults = () => {
      switch (searchFilter) {
        case Filters.community:
          return communityPackages.isEmpty();
        case Filters.certified:
          return certifiedPackages.isEmpty();
        case Filters.all:
          return certifiedPackages.isEmpty() && communityPackages.isEmpty();
      }
    };

    return renderPage(
      <div className="container">
        <div className="pod flush-horizontal flush-top">
          <FilterBar>
            <FieldAutofocus>
              <FilterInputText
                className="flush-bottom"
                placeholder="Search catalog"
                searchString={searchString}
                handleFilterChange={this.handleSearchStringChange}
              />
            </FieldAutofocus>
            {this.getFilterButtons(
              certifiedPackages.list.length,
              communityPackages.list.length
            )}
          </FilterBar>
        </div>
        {certifiedPackages.getItems().length &&
        (searchFilter === Filters.all || searchFilter === Filters.certified)
          ? this.getCertifiedPackagesGrid(certifiedPackages)
          : null}
        {communityPackages.getItems().length &&
        (searchFilter === Filters.all || searchFilter === Filters.community)
          ? this.getCommunityPackagesGrid(communityPackages)
          : null}
        {hasNoResults() ? this.renderNoResults() : null}
      </div>
    );
  }
}

PackagesTab.contextTypes = {
  router: routerShape
};

module.exports = PackagesTab;
