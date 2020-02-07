import * as React from "react";

import { i18nMark } from "@lingui/react";

import UserStore from "#SRC/js/stores/UserStore";
import Util from "#SRC/js/utils/Util";

import AccountAdvancedACLsTab from "../../../components/AccountAdvancedACLsTab";
import AccountDetailPage from "../../../components/AccountDetailPage";
import ACLUsersActions from "../actions/ACLUsersActions";
import ACLUserStore from "../stores/ACLUserStore";
import UserEditFormModal from "./modals/UserEditFormModal";

class UserDetailPage extends AccountDetailPage {
  constructor(...args) {
    super(...args);

    // prettier-ignore
    this.store_listeners = this.store_listeners.concat([
      {name: "aclUser", events: ["fetchSuccess", "updateSuccess", "fetchedDetailsSuccess", "fetchedDetailsError"], suppressUpdate: true},
      {name: "user", events: ["deleteSuccess", "deleteError"]}
    ]);

    // Debounce onACLChange as sometimes it may get called too frequently.
    // For example, when adding bulk permissions
    this.onACLChange = Util.debounce(() => {
      ACLUserStore.fetchUserWithDetails(this.getAccountID());
    }, 300);
  }

  componentDidMount() {
    super.componentDidMount();

    ACLUserStore.fetchUserWithDetails(this.getAccountID());
  }

  onAclUserStoreUpdateSuccess() {
    ACLUserStore.fetchUser(this.getAccountID());
  }

  onAclUserStoreFetchSuccess() {
    this.forceUpdate();
  }

  onAclUserStoreFetchedDetailsSuccess() {
    if (this.state.fetchedDetailsError === true) {
      this.setState({ fetchedDetailsError: false });
    } else {
      this.forceUpdate();
    }
  }

  onAclUserStoreFetchedDetailsError(userID) {
    if (userID === this.getAccountID()) {
      this.setState({ fetchedDetailsError: true });
    } else {
      this.forceUpdate();
    }
  }

  onUserStoreDeleteError(error) {
    this.setState({
      deleteUpdateError: error,
      pendingRequest: false
    });
  }

  onUserStoreDeleteSuccess() {
    this.setState({
      openDeleteConfirmation: false,
      pendingRequest: false
    });

    this.context.router.push("/organization/users");
  }
  handleEditAccount = model => {
    ACLUserStore.updateUser(this.getAccountID(), model);
  };

  deleteAccount() {
    UserStore.deleteUser(this.getAccountID());
  }
  getAccount = () => {
    return ACLUserStore.getUser(this.getAccountID());
  };

  getAccountID() {
    return this.props.params.userID;
  }
  fetchPermissions = () => {
    ACLUsersActions.fetchUserPermissions(this.getAccountID());
  };

  renderPermissionsTabView() {
    return (
      <AccountAdvancedACLsTab
        fetchPermissions={this.fetchPermissions.bind(this)}
        getAccountDetails={this.getAccount.bind(this)}
        itemID={this.getAccountID()}
        storeListenerName="aclUser"
      />
    );
  }

  renderEditFormModal() {
    return (
      <UserEditFormModal
        account={this.getAccount()}
        closeByBackdropClick={true}
        disabled={this.state.pendingRequest}
        open={this.state.openEditFormModal}
        onClose={this.handleEditCancel}
        onSubmit={this.handleEditAccount}
      />
    );
  }
}

UserDetailPage.routeConfig = {
  label: i18nMark("Users"),
  matches: /^\/organization\/users/
};

export default UserDetailPage;
