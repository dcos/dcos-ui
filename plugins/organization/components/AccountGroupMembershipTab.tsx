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
import Util from "#SRC/js/utils/Util";

import AccountGroupTable from "./AccountGroupTable";
import ACLGroupStore from "../submodules/groups/stores/ACLGroupStore";
import ACLGroupsStore from "../submodules/groups/stores/ACLGroupsStore";

class AccountGroupMembershipTab extends mixin(StoreMixin) {
  static propTypes = {
    accountID: PropTypes.string.isRequired,
    getAccountDetails: PropTypes.func.isRequired,
  };

  state = {
    pendingRequest: false,
    requestGroupsSuccess: false,
    requestGroupsError: false,
    searchString: "",
    selectedGroup: [],
    userUpdateError: null,
  };

  // prettier-ignore
  store_listeners = [
    { name: "aclGroup", events: ["deleteUserSuccess", "deleteUserError", "addUserSuccess"] },
    { name: "aclGroups", events: ["success", "error"] }
  ];

  componentDidMount() {
    super.componentDidMount();
    ACLGroupsStore.fetchGroups();
  }

  onAclGroupsStoreError() {
    this.setState({
      requestGroupsSuccess: false,
      requestGroupsError: true,
    });
  }

  onAclGroupsStoreSuccess() {
    this.setState({
      requestGroupsSuccess: true,
      requestGroupsError: false,
    });
  }

  onAclGroupStoreAddUserSuccess() {
    this.setState({
      searchString: "",
      selectedGroup: [],
    });
  }

  handleGroupSelection = (selectedGroups) => {
    const group = selectedGroups.shift();

    if (!group || !group.id) {
      return;
    }

    this.setState({ selectedGroup: [group] });

    ACLGroupStore.addUser(group.id, this.props.accountID);
    this.typeahead.handleInputClear();
  };

  handleSearchStringChange = (searchString) => {
    this.setState({ searchString });
  };

  getDropdownItems() {
    const groups = ACLGroupsStore.getGroups()
      .getItems()
      .sort(Util.getLocaleCompareSortFn("gid"));

    const userDetails = this.props.getAccountDetails();
    const userGroups = userDetails.getGroups().getItems();
    const items = groups.filter((group) => {
      // Filter out any group which is in permissions
      const gid = group.get("gid");

      return !userGroups.some(
        (currentGroup) => currentGroup.get("gid") === gid
      );
    });

    return items.map((group) => ({
      id: group.gid,
      name: group.gid,
    }));
  }

  render() {
    const { accountID, getAccountDetails, i18n } = this.props;
    const {
      searchString,
      requestGroupsError,
      requestGroupsSuccess,
      selectedGroup,
    } = this.state;

    if (requestGroupsError) {
      return <RequestErrorMsg />;
    }

    if (!requestGroupsSuccess) {
      return <Loader />;
    }

    return (
      <div>
        <FilterBar>
          <Typeahead
            emptyLabel={i18n._(t`No groups to add`)}
            labelKey="name"
            handleFilterChange={this.handleSearchStringChange}
            items={this.getDropdownItems()}
            onDropdownItemSelection={this.handleGroupSelection}
            placeholder={i18n._(t`Add Group`)}
            ref={(ref) => {
              if (ref) {
                this.typeahead = ref;
              }
            }}
            selected={selectedGroup}
            scrollContainer=".gm-scroll-view"
            scrollContainerParentSelector=".gm-prevented"
            searchString={searchString}
            transition={true}
            wrapperClassName="dropdown"
          />
        </FilterBar>
        <AccountGroupTable
          accountID={accountID}
          getAccountDetails={getAccountDetails}
        />
      </div>
    );
  }
}

export default withI18n()(AccountGroupMembershipTab);
