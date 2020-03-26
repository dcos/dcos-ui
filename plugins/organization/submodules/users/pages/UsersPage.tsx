import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Hooks } from "PluginSDK";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import UsersStore from "#SRC/js/stores/UsersStore";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Page from "#SRC/js/components/Page";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import UserFormModal from "#SRC/js/components/modals/UserFormModal";

import ACLDirectoriesStore from "../../directories/stores/ACLDirectoriesStore";
import LDAPUserFormModal from "../components/modals/LDAPUserFormModal";
import OrganizationTab from "../../../components/OrganizationTab";

const USERS_CHANGE_EVENTS = [
  "onUserStoreCreateSuccess",
  "onUserStoreDeleteSuccess",
];

const UsersBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Users">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/organization/users" />}>Users</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Users} breadcrumbs={crumbs} />
  );
};

class UsersPage extends mixin(StoreMixin) {
  static propTypes = {
    items: PropTypes.array.isRequired,
  };
  constructor(...args) {
    super(...args);

    this.state = {
      openNewLDAPUserModal: false,
      openNewUserModal: false,
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "user", events: ["createSuccess", "deleteSuccess"], suppressUpdate: true},
      {name: "aclDirectories", events: ["fetchSuccess"]},
      { name: "aclUser", events: ["createLDAPSuccess", "updateSuccess"] }
    ];

    Hooks.applyFilter(
      "organizationTabChangeEvents",
      USERS_CHANGE_EVENTS
    ).forEach((event) => {
      this[event] = this.onUsersChange;
    });

    this.selectedIDSet = {};
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);
    ACLDirectoriesStore.fetchDirectories();
  }

  onAclUserStoreCreateLDAPSuccess() {
    UsersStore.fetchUsers();
  }

  onUsersChange() {
    UsersStore.fetchUsers();
  }
  handleLDAPUserClick = () => {
    this.setState({ openNewLDAPUserModal: true });
  };
  handleLDAPUserClose = () => {
    this.setState({ openNewLDAPUserModal: false });
  };
  handleNewUserClick = () => {
    this.setState({ openNewUserModal: true });
  };
  handleNewUserClose = () => {
    this.setState({ openNewUserModal: false });
  };

  getAddDropdownItems() {
    const hasDirectories =
      ACLDirectoriesStore.getDirectories().getItems().length > 0;

    // We check if service account as we don't import service accounts
    // so we only want to show one button.
    if (!hasDirectories) {
      return {
        label: i18nMark("New User"),
        onItemSelect: this.handleNewUserClick,
      };
    }

    return [
      {
        label: i18nMark("Add Local User"),
        onItemSelect: this.handleNewUserClick,
      },
      {
        label: i18nMark("Import LDAP User"),
        onItemSelect: this.handleLDAPUserClick,
      },
    ];
  }

  render() {
    const { items } = this.props;
    const { openNewLDAPUserModal } = this.state;

    return (
      <Page>
        <Page.Header
          breadcrumbs={<UsersBreadcrumbs />}
          addButton={this.getAddDropdownItems()}
        />
        <OrganizationTab
          key="organization-tab"
          items={items}
          itemID="uid"
          itemName="user"
        />
        <UserFormModal
          open={this.state.openNewUserModal}
          onClose={this.handleNewUserClose}
        />
        <LDAPUserFormModal
          key="import-ldap-user"
          open={openNewLDAPUserModal}
          onClose={this.handleLDAPUserClose}
        />
      </Page>
    );
  }
}

export default UsersPage;
