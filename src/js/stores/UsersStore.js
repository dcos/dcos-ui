import {Store} from 'mesosphere-shared-reactjs';

import UsersActions from '../events/UsersActions';
import {
  REQUEST_USERS_SUCCESS,
  REQUEST_USERS_ERROR,
  SERVER_ACTION
} from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import {
  USERS_CHANGE,
  USERS_REQUEST_ERROR
} from '../constants/EventTypes';
import GetSetMixin from '../mixins/GetSetMixin';
import UsersList from '../structs/UsersList';

const UsersStore = Store.createStore({
  storeID: 'users',

  mixins: [GetSetMixin],

  getSet_data: {
    users: []
  },

  fetchUsers: UsersActions.fetch,

  getUsers() {
    return new UsersList({items: this.get('users')});
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  processUsers: function (users) {
    this.set({users});
    this.emit(USERS_CHANGE);
  },

  processUsersError: function (error) {
    this.emit(USERS_REQUEST_ERROR, error);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case REQUEST_USERS_SUCCESS:
        UsersStore.processUsers(action.data);
        break;
      case REQUEST_USERS_ERROR:
        UsersStore.processUsersError(action.data);
        break;
    }
  })

});

module.exports = UsersStore;
