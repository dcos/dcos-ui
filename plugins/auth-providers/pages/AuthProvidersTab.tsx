import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import AuthProviderDetailPage from "../pages/AuthProviderDetailPage";
import AuthProvidersStore from "../stores/AuthProvidersStore";
import AuthProvidersTable from "../components/AuthProvidersTable";
import AuthProvidersModal from "../components/AuthProvidersModal";

const AuthProvidersBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Identity Providers">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/settings/identity-providers" />}>
          Identity Providers
        </Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Gear} breadcrumbs={crumbs} />
  );
};

class AuthProvidersTab extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.store_listeners = [
      { name: "authProviders", events: ["change", "error"] },
    ];

    this.state = {
      openNewItemModal: false,
      searchString: "",
      storeFetchError: false,
      storeFetchSuccess: false,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    AuthProvidersStore.fetch();
  }
  onAuthProvidersStoreChange = () => {
    this.setState({
      storeFetchError: false,
      storeFetchSuccess: true,
    });
  };
  onAuthProvidersStoreError = () => {
    this.setState({
      storeFetchError: true,
      storeFetchSuccess: false,
    });
  };

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
  }
  handleNewItemClick = () => {
    this.setState({ openNewItemModal: true });
  };
  handleNewItemClose = () => {
    this.setState({ openNewItemModal: false });
  };

  resetFilter() {
    this.setState({ searchString: "" });
  }

  getVisibleItems(items, searchString) {
    return items
      .filterItems((item) => item.getDescription().includes(searchString))
      .getItems();
  }

  render() {
    const { params } = this.props;

    if (params && "providerID" in params) {
      return <AuthProviderDetailPage params={params} />;
    }

    const { state } = this;

    if (state.storeFetchError) {
      return (
        <Page>
          <Page.Header breadcrumbs={<AuthProvidersBreadcrumbs />} />
          <RequestErrorMsg />
        </Page>
      );
    }

    if (!this.state.storeFetchSuccess) {
      return (
        <Page>
          <Page.Header breadcrumbs={<AuthProvidersBreadcrumbs />} />
          <Loader />
        </Page>
      );
    }

    const providers = AuthProvidersStore.getProviders();
    const visibleItems = this.getVisibleItems(providers, state.searchString);

    return (
      <Page>
        <Page.Header
          breadcrumbs={<AuthProvidersBreadcrumbs />}
          addButton={{
            onItemSelect: this.handleNewItemClick,
            label: "Add Provider",
          }}
        />
        <div className="flex-container-col">
          <div className="users-table-header">
            <FilterHeadline
              onReset={this.resetFilter}
              name="Identity Provider"
              currentLength={visibleItems.length}
              totalLength={providers.getItems().length}
            />
            <FilterBar>
              <FilterInputText
                className="flush-bottom"
                searchString={state.searchString}
                handleFilterChange={this.handleSearchStringChange}
              />
            </FilterBar>
          </div>
          <div className="page-content-fill flex-grow flex-container-col">
            <AuthProvidersTable data={visibleItems} />
          </div>
          <AuthProvidersModal
            open={this.state.openNewItemModal}
            onClose={this.handleNewItemClose}
          />
        </div>
      </Page>
    );
  }
}

AuthProvidersTab.routeConfig = {
  label: i18nMark("Identity Providers"),
  matches: /^\/settings\/identity-providers/,
};

export default AuthProvidersTab;
