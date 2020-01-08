import { i18nMark, Trans } from "@lingui/react";
import classNames from "classnames";
import mixin from "reactjs-mixin";
import { Hooks } from "PluginSDK";
import { Link, routerShape } from "react-router";
import { MountService } from "foundation-ui";
import * as React from "react";
import { Badge } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import FilterBar from "#SRC/js/components/FilterBar";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
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
          <Trans render="span" id="Catalog" />
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

const PackagesEmptyState = () => (
  <AlertPanel>
    <AlertPanelHeader>
      <Trans render="span" id="No package repositories" />
    </AlertPanelHeader>
    <Trans
      render="p"
      className="tall"
      id="You need at least one package repository with some packages to be able to install packages. For more <0>information on repositories</0>."
      components={[
        <a
          target="_blank"
          href={MetadataStore.buildDocsURI("/administering-clusters/repo")}
        />
      ]}
    />
    <div className="button-collection flush-bottom">
      <Link to="/settings/repositories" className="button button-primary">
        <Trans render="span" id="Add Package Repository" />
      </Link>
    </div>
  </AlertPanel>
);

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

    // prettier-ignore
    this.store_listeners = [
      {name: "cosmosPackages", events: ["availableError", "availableSuccess"], suppressUpdate: true}
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);
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
          <Trans render="span" id="An Error Occurred" />
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

  getPackageGrid(packages) {
    return packages.getItems().map((cosmosPackage, index) => (
      <CatalogPackageOption
        image={this.getIcon(cosmosPackage)}
        key={index}
        label={this.getPackageOptionBadge(cosmosPackage)}
        onOptionSelect={this.handleDetailOpen.bind(this, cosmosPackage)}
      >
        <div className="h3 flush">{cosmosPackage.getName()}</div>
        <small className="flush">{cosmosPackage.getVersion()}</small>
      </CatalogPackageOption>
    ));
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
        <Trans render="h1" className="short flush-top" id="Certified" />
        <Trans
          render="p"
          className="tall flush-top"
          id="Certified packages are verified by D2iQ for interoperability with DC/OS."
        />
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
          <Trans render="span" id="Community" />
        </h1>
        <Trans
          render="p"
          className="tall flush-top"
          id="Community packages are unverified and unreviewed content from the community."
        />
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
      <Trans
        render="div"
        className="clearfix"
        values={[this.state.searchString]}
        id='No results were found for your search: "{0}" (<0>view all</0>)'
        components={[<a className="clickable" onClick={this.showAll} />]}
      />
    );
  }

  render() {
    const { errorMessage, isLoading, searchString, searchFilter } = this.state;

    if (errorMessage) {
      return renderPage(this.getErrorScreen());
    }
    if (isLoading) {
      return renderPage(<Loader />);
    }

    const packages = CosmosPackagesStore.getAvailablePackages();
    if (packages.isEmpty()) {
      return renderPage(<PackagesEmptyState />);
    }

    const certifiedPackages = packages
      .filterItems(el => el.isCertified())
      .filterItemsByText(searchString);
    const communityPackages = packages
      .filterItems(el => !el.isCertified())
      .filterItemsByText(searchString);

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
        {!certifiedPackages.isEmpty() &&
        (searchFilter === Filters.all || searchFilter === Filters.certified)
          ? this.getCertifiedPackagesGrid(certifiedPackages)
          : null}
        {!communityPackages.isEmpty() &&
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

export default PackagesTab;
