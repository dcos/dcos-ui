import UserStore from "#SRC/js/stores/UserStore";

import AccountActionsModal from "../../../../components/AccountActionsModal";

export default class UsersActionsModal extends AccountActionsModal {
  constructor(...args) {
    super(...args);

    this.store_listeners = this.store_listeners.concat([
      { name: "user", events: ["deleteError", "deleteSuccess"] }
    ]);
  }

  onUserStoreDeleteSuccess(...args) {
    this.onActionSuccess(...args);
  }

  onUserStoreDeleteError(...args) {
    this.onActionError(...args);
  }

  deleteAccount(userID) {
    UserStore.deleteUser(userID);
  }
}
