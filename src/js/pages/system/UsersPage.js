import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Hooks } from "PluginSDK";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import PropTypes from "prop-types";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import Loader from "../../components/Loader";
import OrganizationTab from "./OrganizationTab";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import UsersStore from "../../stores/UsersStore";

const METHODS_TO_BIND = ["onUsersStoreSuccess", "onUsersStoreError"];

const UsersBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Users">
      <BreadcrumbTextContent>
        <Link to="/organization/users">
          <Trans render="span">Users</Trans>
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Users} breadcrumbs={crumbs} />
  );
};

class UsersPage extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = Hooks.applyFilter("usersPageStoreListeners", [
      { name: "users", events: ["success", "error"], suppressUpdate: true }
    ]);

    this.state = {
      usersStoreError: false,
      usersStoreSuccess: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount();
    UsersStore.fetchUsers();
  }

  onUsersChange() {
    UsersStore.fetchUsers();
  }

  onUsersStoreSuccess() {
    this.setState({
      usersStoreError: false,
      usersStoreSuccess: true
    });
  }

  onUsersStoreError() {
    this.setState({
      usersStoreError: true,
      usersStoreSuccess: false
    });
  }

  handleSearchStringChange(searchString) {
    this.setState({ searchString });
  }

  getLoadingScreen() {
    return (
      <Page>
        <Page.Header breadcrumbs={<UsersBreadcrumbs />} />
        <Loader />
      </Page>
    );
  }

  getContents() {
    // We want to always render the portals (side panel and modal),
    // so only this part is showing loading and error screen.
    if (this.state.usersStoreError) {
      return <RequestErrorMsg />;
    }

    if (!this.state.usersStoreSuccess) {
      return this.getLoadingScreen();
    }

    const items = UsersStore.getUsers().getItems();

    return Hooks.applyFilter(
      "usersPageContent",
      <OrganizationTab
        key="organization-tab"
        items={items}
        itemID="uid"
        itemName="user"
      />,
      this
    );
  }

  render() {
    return this.getContents();
  }
}

UsersPage.propTypes = {
  params: PropTypes.object
};

UsersPage.routeConfig = {
  label: i18nMark("Users"),
  matches: /^\/organization\/users/
};

module.exports = UsersPage;
