import ActionsModal from "./ActionsModal";
import UserStore from "../../stores/UserStore";

class UsersActionsModal extends ActionsModal {
  constructor(props) {
    super(props);

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
    const itemsByID = selectedItems.map((item) => item[itemID]);

    itemsByID.forEach((userID) => {
      UserStore.deleteUser(userID);
    });

    this.setState({ pendingRequest: true, requestErrors: [] });
  }
}

export default UsersActionsModal;
