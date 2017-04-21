import { RequestUtil } from "mesosphere-shared-reactjs";
import Util from "../utils/Util";

import {
  REQUEST_USERS_SUCCESS,
  REQUEST_USERS_ERROR,
  REQUEST_USER_CREATE_SUCCESS,
  REQUEST_USER_CREATE_ERROR,
  REQUEST_USER_DELETE_SUCCESS,
  REQUEST_USER_DELETE_ERROR
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";

const UsersActions = {
  fetch() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USERS_SUCCESS,
          data: response.array
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USERS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  addUser(data) {
    let userID = data.uid;
    data = Util.omit(data, ["uid"]);

    if (!userID && data.description) {
      userID = data.description.replace(/\s+/g, "").toLowerCase();
    }

    userID = encodeURIComponent(userID);

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}`,
      method: "PUT",
      data,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_CREATE_SUCCESS,
          userID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID,
          xhr
        });
      }
    });
  },

  deleteUser(userID) {
    userID = encodeURIComponent(userID);
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${userID}`,
      method: "DELETE",
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_DELETE_SUCCESS,
          userID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_USER_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          userID,
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const usersFixture = require("../../../tests/_fixtures/acl/users-unicode.json");

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.UsersActions = {
    fetch: { event: "success", success: { response: usersFixture } },
    addUser: { event: "success" },
    deleteUser: { event: "success" }
  };

  Object.keys(global.actionTypes.UsersActions).forEach(function(method) {
    UsersActions[method] = RequestUtil.stubRequest(
      UsersActions,
      "UsersActions",
      method
    );
  });
}

module.exports = UsersActions;
