import mixin from "reactjs-mixin";
import { Link } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import FilterInputText from "../../components/FilterInputText";
import Loader from "../../components/Loader";
import PackagesTable from "../../components/PackagesTable";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";

const InstalledPackagesBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Installed">
      <BreadcrumbTextContent>
        <Link to="/universe/installed-packages">Installed</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="packages" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = ["handleSearchStringChange"];

class InstalledPackagesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      hasError: false,
      isLoading: true,
      searchString: ""
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: ["installedError", "installedSuccess"],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchInstalledPackages();
  }

  onCosmosPackagesStoreInstalledError() {
    this.setState({ hasError: true });
  }

  onCosmosPackagesStoreInstalledSuccess() {
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

  render() {
    const { hasError, isLoading, searchString } = this.state;
    let content = null;

    if (hasError) {
      content = this.getErrorScreen();
    } else if (isLoading) {
      content = this.getLoadingScreen();
    } else {
      const packages = CosmosPackagesStore.getInstalledPackages().filterItemsByText(
        searchString
      );

      content = (
        <div>
          <div className="control-group form-group flex-no-shrink flex-align-right flush-bottom">
            <FilterInputText
              className="flex-grow"
              placeholder="Search"
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
            />
          </div>
          <PackagesTable packages={packages} filter={searchString} />
        </div>
      );
    }

    return (
      <Page>
        <Page.Header breadcrumbs={<InstalledPackagesBreadcrumbs />} />
        {content}
      </Page>
    );
  }
}

InstalledPackagesTab.routeConfig = {
  label: "Installed",
  matches: /^\/universe\/installed-packages/
};

module.exports = InstalledPackagesTab;
