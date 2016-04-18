import {Store} from 'mesosphere-shared-reactjs';

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
const UserStore = Store.createStore({
  storeID: 'user',

  fetchUsers: UsersActions.fetch,

  addUser: UsersActions.addUser,

  deleteUser: UsersActions.deleteUser,

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      // Create user
      case REQUEST_USER_CREATE_SUCCESS:
        UserStore.emit(USER_CREATE_SUCCESS, action.userID);
        break;
      case REQUEST_USER_CREATE_ERROR:
        UserStore.emit(
          USER_CREATE_ERROR, action.data, action.userID, action.xhr
        );
        break;
      // Delete user
      case REQUEST_USER_DELETE_SUCCESS:
        UserStore.emit(USER_DELETE_SUCCESS, action.userID);
        break;
      case REQUEST_USER_DELETE_ERROR:
        UserStore.emit(
          USER_DELETE_ERROR,
          action.data,
          action.userID
        );
        break;
    }
  })
});

module.exports = UserStore;
