import EventEmitter from 'events';

import AppDispatcher from '../events/AppDispatcher';
import {
  REQUEST_USER_CREATE_SUCCESS,
  REQUEST_USER_CREATE_ERROR,
  REQUEST_USER_DELETE_SUCCESS,
  REQUEST_USER_DELETE_ERROR,
  SERVER_ACTION
} from '../constants/ActionTypes';
import {
  USER_CREATE_SUCCESS,
  USER_CREATE_ERROR,
  USER_DELETE_SUCCESS,
  USER_DELETE_ERROR
} from '../constants/EventTypes';
import UsersActions from '../events/UsersActions';

/**
 * This store will keep track of users and their details
 */
class UserStore extends EventEmitter {
  constructor() {
    super(...arguments);

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
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

  fetchUsers() {
    return UsersActions.fetch(...arguments);
  }

  addUser() {
    return UsersActions.addUser(...arguments);
  }

  deleteUser() {
    return UsersActions.deleteUser(...arguments);
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  get storeID() {
    return 'user';
  }

}

module.exports = new UserStore();
