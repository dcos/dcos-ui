import { withI18n } from "@lingui/react";
import { t } from "@lingui/macro";

import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import FilterBar from "#SRC/js/components/FilterBar";
import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import Typeahead from "#SRC/js/components/Typeahead";
import UsersStore from "#SRC/js/stores/UsersStore";
import Util from "#SRC/js/utils/Util";

import ACLGroupStore from "../stores/ACLGroupStore";
import getACLServiceAccountsStore from "../../service-accounts/stores/ACLServiceAccountsStore";
import GroupMemberTable from "./GroupMemberTable";

const ACLServiceAccountsStore = getACLServiceAccountsStore();

class GroupAccountMembershipTab extends mixin(StoreMixin) {
  static propTypes = {
    accountType: PropTypes.string,
    groupID: PropTypes.string,
  };

  state = {
    groupUpdateError: null,
    openConfirm: false,
    pendingRequest: false,
    requestUsersError: false,
    requestUsersSuccess: false,
    searchString: "",
    selectedUser: [],
    userID: null,
  };

  store_listeners = [
    { name: "aclGroup", events: ["addUserSuccess"] },
    { name: "users", events: ["error", "success"] },
    { name: "aclServiceAccounts", events: ["error", "change"] },
  ];

  componentDidMount() {
    super.componentDidMount();

    ACLServiceAccountsStore.fetchAll();
    UsersStore.fetchUsers();
  }

  onAclGroupStoreAddUserSuccess() {
    this.setState({
      searchString: "",
      selectedUser: [],
    });
  }
  getAllAccounts = () => {
    switch (this.props.accountType) {
      case "user":
        return UsersStore.getUsers().sort(Util.getLocaleCompareSortFn("uid"));

      case "serviceAccount":
        return ACLServiceAccountsStore.getServiceAccounts()
          .getItems()
          .sort(Util.getLocaleCompareSortFn("uid"));
    }
  };

  getMembers() {
    switch (this.props.accountType) {
      case "user":
        return ACLGroupStore.getUsers(this.props.groupID);

      case "serviceAccount":
        return ACLGroupStore.getServiceAccounts(this.props.groupID).getItems();
    }
  }
  onUserSelection = (selectedUsers) => {
    const user = selectedUsers.shift();

    if (!user || !user.id) {
      return;
    }

    this.setState({ selectedUser: [user] });
    ACLGroupStore.addUser(this.props.groupID, user.id);
    this.typeahead.handleInputClear();
  };

  onUsersStoreError() {
    this.setState({
      requestUsersSuccess: false,
      requestUsersError: true,
    });
  }

  onUsersStoreSuccess() {
    this.setState({
      requestUsersSuccess: true,
      requestUsersError: false,
    });
  }
  handleSearchStringChange = (searchString) => {
    this.setState({ searchString });
  };

  getDropdownItems() {
    const accounts = this.getAllAccounts();
    const groupMembers = this.getMembers();

    const filteredUsers = accounts.filter((account) => {
      // Filter out any account which is already part of the group.
      const accountID = account.uid;

      return !groupMembers.some(
        (currentMember) => currentMember.uid === accountID
      );
    });

    return filteredUsers.map((member) => ({
      id: member.uid,
      name: member.uid,
    }));
  }

  render() {
    const { i18n } = this.props;

    if (this.state.requestUsersError) {
      return (
        <div className="pod">
          <RequestErrorMsg />
        </div>
      );
    }

    if (!this.state.requestUsersSuccess) {
      return <Loader />;
    }

    const { searchString } = this.state;

    return (
      <div>
        <FilterBar>
          <Typeahead
            emptyLabel={i18n._(t`No users to add`)}
            labelKey="name"
            handleFilterChange={this.handleSearchStringChange}
            items={this.getDropdownItems()}
            onDropdownItemSelection={this.onUserSelection}
            placeholder={i18n._(t`Add User`)}
            ref={(ref) => {
              if (ref) {
                this.typeahead = ref;
              }
            }}
            selected={this.state.selectedUser}
            searchString={searchString}
            transition={true}
            wrapperClassName="dropdown"
          />
        </FilterBar>
        <GroupMemberTable
          groupID={this.props.groupID}
          accountType={this.props.accountType}
        />
      </div>
    );
  }
}

export default withI18n()(GroupAccountMembershipTab);
