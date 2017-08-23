/* @flow */
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import ActionsModal from "./ActionsModal";
import UserStore from "../../stores/UserStore";

type Props = {
  action: string,
  actionText: Object,
  itemID: string,
  onClose: Function,
  selectedItems: Array<any>,
};

class UsersActionsModal extends ActionsModal {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "user",
        events: ["deleteError", "deleteSuccess"],
        suppressUpdate: true
      }
    ];
  }



  onUserStoreDeleteError(requestError) {
    this.onActionError(requestError);
  }

  onUserStoreDeleteSuccess() {
    this.onActionSuccess();
  }

  handleButtonConfirm() {
    const { itemID, selectedItems } = this.props;
    const itemsByID = selectedItems.map(function(item) {
      return item[itemID];
    });

    itemsByID.forEach(function(userID) {
      UserStore.deleteUser(userID);
    });

    this.setState({ pendingRequest: true, requestErrors: [] });
  }
}

module.exports = UsersActionsModal;
