import { Trans } from "@lingui/macro";

import PropTypes from "prop-types";

import * as React from "react";

import ActionsModal from "#SRC/js/components/modals/ActionsModal";
import UsersStore from "#SRC/js/stores/UsersStore";
import Util from "#SRC/js/utils/Util";

import ACLGroupStore from "../../stores/ACLGroupStore";

class GroupsActionsModal extends ActionsModal {
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
      {name: "users", events: ["success"]},
      {name: "aclGroups", events: ["success", "error"]},
      {name: "aclGroup", events: ["addUserError", "addUserSuccess", "deleteError", "deleteSuccess", "deleteUserError", "deleteUserSuccess"], suppressUpdate: true}
    ];
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    UsersStore.fetchUsers();
  }

  onAclGroupStoreAddUserError(requestError) {
    this.onActionError(requestError);
  }

  onAclGroupStoreAddUserSuccess() {
    this.onActionSuccess();
  }

  onAclGroupStoreDeleteUserError(requestError) {
    this.onActionError(requestError);
  }

  onAclGroupStoreDeleteUserSuccess() {
    this.onActionSuccess();
  }

  onAclGroupStoreDeleteError(requestError) {
    this.onActionError(requestError);
  }

  onAclGroupStoreDeleteSuccess() {
    this.onActionSuccess();
  }

  handleButtonConfirm() {
    const { action, itemID, selectedItems } = this.props;
    const selectedItem = this.state.selectedItem;

    if (selectedItem === null && action !== "delete") {
      this.setState({ validationError: "Select from dropdown." });
    } else {
      const itemsByID = selectedItems.map(item => item[itemID]);

      if (action === "add") {
        itemsByID.forEach(groupID => {
          ACLGroupStore.addUser(groupID, selectedItem.id);
        });
      } else if (action === "remove") {
        itemsByID.forEach(groupID => {
          ACLGroupStore.deleteUser(groupID, selectedItem.id);
        });
      } else if (action === "delete") {
        itemsByID.forEach(groupID => {
          ACLGroupStore.deleteGroup(groupID);
        });
      }

      this.setState({ pendingRequest: true, requestErrors: [] });
    }
  }

  getDropdownItems() {
    const items = UsersStore.getUsers().sort(
      Util.getLocaleCompareSortFn("uid")
    );

    const dropdownItems = items.map(itemInfo => ({
      html: itemInfo.uid,
      id: itemInfo.uid,
      selectedHtml: itemInfo.uid
    }));

    dropdownItems.unshift({
      html: <Trans render="span">Choose a user</Trans>,
      className: "hidden",
      id: "DEFAULT",
      selectable: false
    });

    return dropdownItems;
  }
}

export default GroupsActionsModal;
