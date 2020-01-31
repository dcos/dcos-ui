import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { routerShape, Link } from "react-router";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

import AccountGroupMembershipTab from "./AccountGroupMembershipTab";
import AuthUtil from "../utils/AuthUtil";

const EXTERNAL_CHANGE_EVENTS = [
  "onAclStoreUserGrantSuccess",
  "onAclStoreUserRevokeSuccess",
  "onAclGroupStoreAddUserSuccess",
  "onAclGroupStoreDeleteUserSuccess"
];

class AccountDetailPage extends mixin(StoreMixin) {
  static propTypes = {
    params: PropTypes.object
  };
  constructor(...args) {
    super(...args);

    this.tabs_tabs = {
      advancedACLs: i18nMark("Permissions"),
      membership: i18nMark("Group Membership"),
      details: i18nMark("Details")
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      deleteUpdateError: null,
      fetchedDetailsError: false,
      openDeleteConfirmation: false,
      openEditFormModal: false,
      pendingRequest: false
    };

    // prettier-ignore
    this.store_listeners = [
      { name: "acl", events: ["userGrantSuccess", "userRevokeSuccess"] },
      { name: "aclGroup", events: ["addUserSuccess", "deleteUserSuccess"], suppressUpdate: true },
      { name: "summary", events: ["success"], unmountWhen: (store, event) => event === "success" && store.get("statesProcessed") }
    ];

    EXTERNAL_CHANGE_EVENTS.forEach(event => {
      // #onACLChange is defined in the child component after this runs
      // this is why we call #onACLChange in a closure
      this[event] = () => {
        this.onACLChange(...args);
      };
    });
  }

  tabs_getTabView(...args) {
    const currentTab = this.tabs_tabs[this.state.currentTab].replace(" ", "");
    return this[`render${currentTab}TabView`]?.apply(this, args);
  }

  componentDidMount() {
    super.componentDidMount();
  }
  handleDeleteCancel = () => {
    this.setState({
      openDeleteConfirmation: false
    });
  };
  handleDeleteModalOpen = () => {
    this.setState({
      deleteUpdateError: null,
      openDeleteConfirmation: true
    });
  };
  handleDeleteAccount = () => {
    this.setState({
      pendingRequest: true
    });
    this.deleteAccount();
  };

  handleEditModalOpen() {
    this.setState({
      openEditFormModal: true
    });
  }
  handleEditCancel = () => {
    this.setState({
      openEditFormModal: false
    });
  };

  getActionButtons(account) {
    if (AuthUtil.isSubjectRemote(account)) {
      return [];
    }

    return [
      {
        label: "Edit",
        onItemSelect: this.handleEditModalOpen.bind(this)
      },
      {
        className: "text-danger",
        label: StringUtil.capitalize(UserActions.DELETE),
        onItemSelect: this.handleDeleteModalOpen.bind(this)
      }
    ];
  }

  getBreadcrumbs() {
    const account = this.getAccount();
    let accountID = this.getAccountID();
    let title = accountID;

    if (account) {
      title = account.getDescription();
      accountID = account.getID();

      if (account.isRemote && account.isRemote()) {
        title = account.getID();
      }
    }

    const crumbs = [
      <Breadcrumb key={0} title="Users">
        <BreadcrumbTextContent>
          <Trans render={<Link to="/organization/users" />}>Users</Trans>
        </BreadcrumbTextContent>
      </Breadcrumb>,
      <Breadcrumb key={1} title={title}>
        <BreadcrumbTextContent>
          <Link to={`/organization/users/${accountID}`}>{title}</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ];

    return (
      <Page.Header.Breadcrumbs
        iconID={ProductIcons.Users}
        breadcrumbs={crumbs}
      />
    );
  }

  getDeleteModalContent() {
    let error = null;
    const { deleteUpdateError } = this.state;

    if (deleteUpdateError != null) {
      error = <p className="text-error-state">{deleteUpdateError}</p>;
    }

    const account = this.getAccount();

    return (
      <div>
        <p>
          {account.getDescription()}{" "}
          <Trans render="span">will be deleted</Trans>
        </p>
        {error}
      </div>
    );
  }

  getErrorNotice() {
    return (
      <Page>
        <Page.Header breadcrumbs={this.getBreadcrumbs()} />
        <RequestErrorMsg />
      </Page>
    );
  }

  renderDetailsTabView() {
    const accountDetail = this.getAccount().getDetails();
    const descriptionList = Object.keys(accountDetail).map((key, index) => (
      <ConfigurationMapRow key={index}>
        <ConfigurationMapLabel>{key}</ConfigurationMapLabel>
        <ConfigurationMapValue>{accountDetail[key]}</ConfigurationMapValue>
      </ConfigurationMapRow>
    ));

    return (
      <div className="container">
        <ConfigurationMap>
          <ConfigurationMapSection>{descriptionList}</ConfigurationMapSection>
        </ConfigurationMap>
      </div>
    );
  }

  renderGroupMembershipTabView() {
    return (
      <AccountGroupMembershipTab
        accountID={this.getAccountID()}
        getAccountDetails={this.getAccount.bind(this)}
      />
    );
  }

  render() {
    const account = this.getAccount();

    if (this.state.fetchedDetailsError) {
      return this.getErrorNotice();
    }

    if (account == null || account.get("uid") == null) {
      return (
        <Page>
          <Page.Header breadcrumbs={this.getBreadcrumbs()} />
          <Loader />
        </Page>
      );
    }

    const confirmHeading = (
      <ModalHeading>
        <Trans render="span">Are you sure?</Trans>
      </ModalHeading>
    );

    const { currentTab } = this.state;
    const tabs = [
      {
        label: i18nMark("Permissions"),
        callback: () => {
          this.setState({ currentTab: "advancedACLs" });
        },
        isActive: currentTab === "advancedACLs"
      },
      {
        label: i18nMark("Group Membership"),
        callback: () => {
          this.setState({ currentTab: "membership" });
        },
        isActive: currentTab === "membership"
      },
      {
        label: i18nMark("Details"),
        callback: () => {
          this.setState({ currentTab: "details" });
        },
        isActive: currentTab === "details"
      }
    ];

    // L10NTODO: This class serves as a base class for several others. Adding withI18n
    // wrapper around it in order to translate "Delete" seems to break this
    // inheritance linkage somehow. We should find another way to translate this word.

    const deleteActionText = this.state.pendingRequest
      ? "Deleting..."
      : "Delete";

    return (
      <Page>
        <Page.Header
          actions={this.getActionButtons(account)}
          breadcrumbs={this.getBreadcrumbs()}
          tabs={tabs}
        />
        <div className="flex-container-col">
          {this.tabs_getTabView(account)}
          <Confirm
            closeByBackdropClick={true}
            disabled={this.state.pendingRequest}
            header={confirmHeading}
            open={this.state.openDeleteConfirmation}
            onClose={this.handleDeleteCancel}
            leftButtonCallback={this.handleDeleteCancel}
            leftButtonClassName="button button-primary-link flush-left"
            rightButtonCallback={this.handleDeleteAccount}
            rightButtonClassName="button button-danger"
            rightButtonText={deleteActionText}
            showHeader={true}
          >
            {this.getDeleteModalContent()}
          </Confirm>
          {this.renderEditFormModal()}
        </div>
      </Page>
    );
  }
}

AccountDetailPage.contextTypes = {
  router: routerShape
};

export default AccountDetailPage;
