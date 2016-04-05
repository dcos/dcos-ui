import Util from '../utils/Util';

import {
  REQUEST_USERS_SUCCESS,
  REQUEST_USERS_ERROR,
  REQUEST_USER_CREATE_SUCCESS,
  REQUEST_USER_CREATE_ERROR,
  REQUEST_USER_DELETE_SUCCESS,
  REQUEST_USER_DELETE_ERROR
} from '../constants/ActionTypes';

import AppDispatcher from './AppDispatcher';
import RequestUtil from '../utils/RequestUtil';
import Config from '../config/Config';

const UsersActions = {
  fetch: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USERS_SUCCESS,
          data: response.array
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USERS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  addUser: function (data) {
    let userID = data.uid;
    data = Util.omit(data, ['uid']);

    if (!userID && data.description) {
      userID = data.description.replace(/\s+/g, '').toLowerCase();
    }

    userID = encodeURIComponent(userID);

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}`,
      method: 'PUT',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_CREATE_SUCCESS,
          userID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID,
          xhr
        });
      }
    });
  },

  deleteUser: function (userID) {
    userID = encodeURIComponent(userID);
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}`,
      method: 'DELETE',
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_DELETE_SUCCESS,
          userID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID
        });
      }
    });
  }
};

if (Config.useFixtures) {
  let usersFixture = require('../../../tests/_fixtures/acl/users-unicode.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.UsersActions = {
    fetch: {event: 'success', success: {response: usersFixture}},
    addUser: {event: 'success'},
    deleteUser: {event: 'success'}
  };

  Object.keys(global.actionTypes.UsersActions).forEach(function (method) {
    UsersActions[method] = RequestUtil.stubRequest(
      UsersActions, 'UsersActions', method
    );
  });
}

module.exports = UsersActions;
