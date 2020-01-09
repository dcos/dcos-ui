import PluginSDK from "PluginSDK";

import {
  REQUEST_USERS_SUCCESS,
  REQUEST_USERS_ERROR,
  SERVER_ACTION
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import { USERS_CHANGE, USERS_REQUEST_ERROR } from "../constants/EventTypes";
import GetSetBaseStore from "./GetSetBaseStore";
import UsersActions from "../events/UsersActions";
import Item from "../structs/Item";

class UsersStore extends GetSetBaseStore {
  constructor(...args) {
    super(...args);

    this.getSet_data = { users: [] };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: USERS_CHANGE,
        error: USERS_REQUEST_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      const action = payload.action;
      switch (action.type) {
        case REQUEST_USERS_SUCCESS:
          this.set({ users: action.data });
          this.emit(USERS_CHANGE);
          break;
        case REQUEST_USERS_ERROR:
          this.emit(USERS_REQUEST_ERROR, action.data);
          break;
      }
    });
  }

  fetchUsers(...args) {
    return UsersActions.fetch(...args);
  }

  getUsers() {
    return this.getUsersRaw().map(user => new Item(user));
  }

  getUsersRaw() {
    return this.get("users");
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  get storeID() {
    return "users";
  }
}

export default new UsersStore();
