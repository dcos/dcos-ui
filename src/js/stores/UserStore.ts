import EventEmitter from "events";
import PluginSDK from "PluginSDK";

import AppDispatcher from "../events/AppDispatcher";
import {
  REQUEST_USER_CREATE_SUCCESS,
  REQUEST_USER_CREATE_ERROR,
  REQUEST_USER_DELETE_SUCCESS,
  REQUEST_USER_DELETE_ERROR
} from "../constants/ActionTypes";
import {
  USER_CREATE_SUCCESS,
  USER_CREATE_ERROR,
  USER_DELETE_SUCCESS,
  USER_DELETE_ERROR
} from "../constants/EventTypes";
import UsersActions from "../events/UsersActions";

/**
 * This store will keep track of users and their details
 */
class UserStore extends EventEmitter {
  addChangeListener = this.on;
  addUser = UsersActions.addUser;
  deleteUser = UsersActions.deleteUser;
  fetchUsers = UsersActions.fetch;
  removeChangeListener = this.removeListener;
  storeID = "user";

  constructor() {
    super();

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        createSuccess: USER_CREATE_SUCCESS,
        createError: USER_CREATE_ERROR,
        deleteSuccess: USER_DELETE_SUCCESS,
        deleteError: USER_DELETE_ERROR
      },
      unmountWhen: () => false
    });

    AppDispatcher.register(({ action }) => {
      switch (action.type) {
        // Create user
        case REQUEST_USER_CREATE_SUCCESS:
          this.emit(USER_CREATE_SUCCESS, action.userID);
          break;
        case REQUEST_USER_CREATE_ERROR:
          this.emit(USER_CREATE_ERROR, action.data, action.userID, action.xhr);
          break;
        // Delete user
        case REQUEST_USER_DELETE_SUCCESS:
          this.emit(USER_DELETE_SUCCESS, action.userID);
          break;
        case REQUEST_USER_DELETE_ERROR:
          this.emit(USER_DELETE_ERROR, action.data, action.userID);
          break;
      }
    });
  }
}

export default new UserStore();
