import PropTypes from "prop-types";

import ActionsModal from "./ActionsModal";
import UserStore from "../../stores/UserStore";

class UsersActionsModal extends ActionsModal {
  constructor(...args) {
    super(...args);

    // prettier-ignore
    this.store_listeners = [
      {name: "user", events: ["deleteError", "deleteSuccess"], suppressUpdate: true}
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
    const itemsByID = selectedItems.map(item => item[itemID]);

    itemsByID.forEach(userID => {
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
