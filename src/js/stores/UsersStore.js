import GetSetBaseStore from './GetSetBaseStore';
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
import UsersList from '../structs/UsersList';

class UsersStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      users: []
    };

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case REQUEST_USERS_SUCCESS:
          this.processUsers(action.data);
          break;
        case REQUEST_USERS_ERROR:
          this.processUsersError(action.data);
          break;
      }
    });
  }

  fetchUsers() {
    return UsersActions.fetch(...arguments);
  }

  getUsers() {
    return new UsersList({items: this.getUsersRaw()});
  }

  getUsersRaw() {
    return this.get('users');
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  processUsers(users) {
    this.set({users});
    this.emit(USERS_CHANGE);
  }

  processUsersError(error) {
    this.emit(USERS_REQUEST_ERROR, error);
  }

  get storeID() {
    return 'users';
  }

}

module.exports = new UsersStore();
