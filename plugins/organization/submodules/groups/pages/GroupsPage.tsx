import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Page from "#SRC/js/components/Page";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

import ACLDirectoriesStore from "../../directories/stores/ACLDirectoriesStore";
import ACLGroupsStore from "../stores/ACLGroupsStore";
import GroupFormModal from "../components/GroupFormModal";
import LDAPGroupFormModal from "../components/modals/LDAPGroupFormModal";
import OrganizationTab from "../../../components/OrganizationTab";

const EXTERNAL_CHANGE_EVENTS = [
  "onAclGroupStoreCreateSuccess",
  "onAclGroupStoreDeleteSuccess",
  "onAclGroupStoreUpdateSuccess",
];

const GroupsBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Groups">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/organization/groups" />}>Groups</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Users} breadcrumbs={crumbs} />
  );
};

class GroupsPage extends mixin(StoreMixin) {
  static propTypes = {
    params: PropTypes.object,
  };
  constructor(...args) {
    super(...args);

    this.store_listeners = [
      { name: "marathon", events: ["success"] },
      { name: "aclDirectories", events: ["fetchSuccess"] },
      { name: "aclGroups", events: ["success", "error"] },
      {
        name: "aclGroup",
        events: [
          "createLDAPSuccess",
          "createSuccess",
          "deleteSuccess",
          "updateSuccess",
        ],
      },
    ];

    this.state = {
      groupsStoreError: false,
      groupsStoreSuccess: false,
      openNewGroupModal: false,
      openNewLDAPGroupModal: false,
    };

    EXTERNAL_CHANGE_EVENTS.forEach((event) => {
      this[event] = this.onAclGroupsChange;
    });
  }

  componentDidMount() {
    super.componentDidMount();
    ACLGroupsStore.fetchGroups();
    ACLDirectoriesStore.fetchDirectories();
  }

  onAclGroupStoreCreateLDAPSuccess() {
    ACLGroupsStore.fetchGroups();
  }

  onAclGroupsChange() {
    ACLGroupsStore.fetchGroups();
  }
  onAclGroupsStoreSuccess = () => {
    this.setState({
      groupsStoreError: false,
      groupsStoreSuccess: true,
    });
  };
  onAclGroupsStoreError = () => {
    this.setState({
      groupsStoreError: true,
      groupsStoreSuccess: false,
    });
  };
  handleLDAPGroupClick = () => {
    this.setState({ openNewLDAPGroupModal: true });
  };
  handleLDAPGroupClose = () => {
    this.setState({ openNewLDAPGroupModal: false });
  };
  handleNewGroupClick = () => {
    this.setState({ openNewGroupModal: true });
  };
  handleNewGroupClose = () => {
    this.setState({ openNewGroupModal: false });
  };

  getAddDropdownItems() {
    const hasDirectories =
      ACLDirectoriesStore.getDirectories().getItems().length > 0;

    // We check if service account as we don't import service accounts
    // so we only want to show one button.
    if (!hasDirectories) {
      return {
        label: i18nMark("New Group"),
        onItemSelect: this.handleNewGroupClick,
      };
    }

    return [
      {
        label: i18nMark("Add Local Group"),
        onItemSelect: this.handleNewGroupClick,
      },
      {
        label: i18nMark("Import LDAP Group"),
        onItemSelect: this.handleLDAPGroupClick,
      },
    ];
  }

  getContents() {
    // We want to always render the portals (side panel and modal),
    // so only this part is showing loading and error screen
    if (this.state.groupsStoreError) {
      return <RequestErrorMsg />;
    }

    if (!this.state.groupsStoreSuccess) {
      return <Page.Header breadcrumbs={<GroupsBreadcrumbs />} />;
    }

    const items = ACLGroupsStore.getGroups().getItems();

    return <OrganizationTab items={items} itemID="gid" itemName="group" />;
  }

  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<GroupsBreadcrumbs />}
          addButton={this.getAddDropdownItems()}
        />
        {this.getContents()}
        <GroupFormModal
          open={this.state.openNewGroupModal}
          onClose={this.handleNewGroupClose}
        />
        <LDAPGroupFormModal
          open={this.state.openNewLDAPGroupModal}
          onClose={this.handleLDAPGroupClose}
        />
      </Page>
    );
  }
}

GroupsPage.routeConfig = {
  label: i18nMark("Groups"),
  matches: /^\/organization\/groups/,
};

export default GroupsPage;
