import { RequestUtil } from "mesosphere-shared-reactjs";

import {
  REQUEST_LOGIN_SUCCESS,
  REQUEST_LOGIN_ERROR,
  REQUEST_LOGOUT_SUCCESS,
  REQUEST_LOGOUT_ERROR
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import Config from "../config/Config";

const AuthActions = {
  login(credentials, target) {
    let query = "";
    if (target) {
      query = `?target=${encodeURIComponent(target)}`;
    }

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/auth/login${query}`,
      method: "POST",
      data: credentials,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_LOGIN_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_LOGIN_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  logout() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/auth/logout`,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_LOGOUT_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_LOGOUT_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  AuthActions.login = function() {
    // base64 encoded - {is_remote: false, uid: "bootstrapuser", description: "Bootstrap superuser"}
    global.document.cookie =
      "dcos-acs-info-cookie=" +
      "eyJ1aWQiOiJqb2UiLCJkZXNjcmlwdGlvbiI6IkpvZSBEb2UifQ==";
    AppDispatcher.handleServerAction({
      type: REQUEST_LOGIN_SUCCESS
    });
  };
}

module.exports = AuthActions;
