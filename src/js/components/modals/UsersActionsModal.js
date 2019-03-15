/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";

import React from "react";
/* eslint-enable no-unused-vars */

import ActionsModal from "./ActionsModal";
import UserStore from "../../stores/UserStore";

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

UsersActionsModal.propTypes = {
  action: PropTypes.string.isRequired,
  actionText: PropTypes.object.isRequired,
  itemID: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedItems: PropTypes.array.isRequired
};

export default UsersActionsModal;
