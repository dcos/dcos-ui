import { Trans } from "@lingui/macro";

import PropTypes from "prop-types";

import * as React from "react";

import ActionsModal from "#SRC/js/components/modals/ActionsModal";
import Util from "#SRC/js/utils/Util";

import ACLGroupStore from "../submodules/groups/stores/ACLGroupStore";
import ACLGroupsStore from "../submodules/groups/stores/ACLGroupsStore";

const BIND_ERROR_HANDLERS = [
  "onAclGroupStoreAddUserError",
  "onAclGroupStoreDeleteUserError"
];
const BIND_SUCCESS_HANDLERS = [
  "onAclGroupStoreAddUserSuccess",
  "onAclGroupStoreDeleteUserSuccess"
];

export default class AccountsActionsModal extends ActionsModal {
  static propTypes = {
    action: PropTypes.string.isRequired,
    actionText: PropTypes.object.isRequired,
    itemID: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedItems: PropTypes.array.isRequired
  };
  constructor(...args) {
    super(...args);

    // prettier-ignore
    this.store_listeners = [
      { name: "aclGroups", events: ["success", "error"] },
      { name: "aclGroup", events: ["addUserError", "addUserSuccess", "deleteUserError", "deleteUserSuccess"], suppressUpdate: true }
    ];

    BIND_ERROR_HANDLERS.forEach(handler => {
      this[handler] = this.onActionError;
    });

    BIND_SUCCESS_HANDLERS.forEach(handler => {
      this[handler] = this.onActionSuccess;
    });
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    ACLGroupsStore.fetchGroups();
  }

  handleButtonConfirm() {
    const { action, itemID, selectedItems } = this.props;
    const selectedItem = this.state.selectedItem;

    if (selectedItem === null && action !== "delete") {
      this.setState({ validationError: "Select from dropdown." });

      return;
    }

    const itemsByID = selectedItems.map(item => item[itemID]);

    switch (action) {
      case "add":
        itemsByID.forEach(accountID => {
          ACLGroupStore.addUser(selectedItem.id, accountID);
        });
        break;
      case "remove":
        itemsByID.forEach(accountID => {
          ACLGroupStore.deleteUser(selectedItem.id, accountID);
        });
        break;
      case "delete":
        itemsByID.forEach(this.deleteAccount);
        break;
    }

    this.setState({ pendingRequest: true, requestErrors: [] });
  }

  getDropdownItems() {
    const itemID = "gid";
    const items = ACLGroupsStore.getGroups()
      .getItems()
      .sort(Util.getLocaleCompareSortFn(itemID));

    const dropdownItems = items.map(itemInfo => ({
      html: itemInfo[itemID],
      id: itemInfo[itemID],
      selectedHtml: itemInfo[itemID]
    }));

    dropdownItems.unshift({
      html: <Trans render="span">Choose a group</Trans>,
      className: "hidden",
      id: "DEFAULT",
      selectable: false
    });

    return dropdownItems;
  }
}
