import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Hooks } from "PluginSDK";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import Loader from "../../components/Loader";
import OrganizationTab from "./OrganizationTab";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import UsersStore from "../../stores/UsersStore";

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
  static propTypes = {
    params: PropTypes.object
  };
  constructor(...args) {
    super(...args);

    this.store_listeners = Hooks.applyFilter("usersPageStoreListeners", [
      { name: "users", events: ["success", "error"], suppressUpdate: true }
    ]);

    this.state = {
      usersStoreError: false,
      usersStoreSuccess: false
    };
  }

  componentDidMount() {
    super.componentDidMount();
    UsersStore.fetchUsers();
  }

  onUsersChange() {
    UsersStore.fetchUsers();
  }
  onUsersStoreSuccess = () => {
    this.setState({
      usersStoreError: false,
      usersStoreSuccess: true
    });
  };
  onUsersStoreError = () => {
    this.setState({
      usersStoreError: true,
      usersStoreSuccess: false
    });
  };

  handleSearchStringChange(searchString) {
    this.setState({ searchString });
  }

  getContents() {
    // We want to always render the portals (side panel and modal),
    // so only this part is showing loading and error screen.
    if (this.state.usersStoreError) {
      return <RequestErrorMsg />;
    }

    if (!this.state.usersStoreSuccess) {
      return (
        <Page>
          <Page.Header breadcrumbs={<UsersBreadcrumbs />} />
          <Loader />
        </Page>
      );
    }

    const items = UsersStore.getUsers();

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

UsersPage.routeConfig = {
  label: i18nMark("Users"),
  matches: /^\/organization\/users/
};

export default UsersPage;
