import PluginSDK, { Hooks } from "PluginSDK";

import {
  REQUEST_LOGIN_SUCCESS,
  REQUEST_LOGIN_ERROR,
  REQUEST_LOGOUT_SUCCESS,
  REQUEST_LOGOUT_ERROR,
  SERVER_ACTION
} from "../constants/ActionTypes";
import {
  AUTH_USER_LOGIN_CHANGED,
  AUTH_USER_LOGOUT_SUCCESS,
  AUTH_USER_LOGIN_ERROR,
  AUTH_USER_LOGOUT_ERROR
} from "../constants/EventTypes";
import AppDispatcher from "../events/AppDispatcher";
import AuthActions from "../events/AuthActions";
import CookieUtils from "../utils/CookieUtils";
import GetSetBaseStore from "./GetSetBaseStore";

class AuthStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: AUTH_USER_LOGIN_CHANGED,
        error: AUTH_USER_LOGIN_ERROR,
        logoutSuccess: AUTH_USER_LOGOUT_SUCCESS,
        logoutError: AUTH_USER_LOGOUT_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case REQUEST_LOGIN_SUCCESS:
          this.processLoginSuccess();
          break;
        case REQUEST_LOGIN_ERROR:
          this.emit(AUTH_USER_LOGIN_ERROR, action.data, action.xhr);
          break;
        case REQUEST_LOGOUT_SUCCESS:
          this.processLogoutSuccess();
          break;
        case REQUEST_LOGOUT_ERROR:
          this.emit(AUTH_USER_LOGOUT_ERROR, action.data);
          break;
      }

      return true;
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  login() {
    AuthActions.login(...arguments);
  }

  logout() {
    AuthActions.logout(...arguments);
  }

  isLoggedIn() {
    return !!CookieUtils.getUserMetadata();
  }

  getUser() {
    const userCode = CookieUtils.getUserMetadata();

    if (userCode == null) {
      return null;
    }

    try {
      return JSON.parse(atob(userCode));
    } catch (err) {
      return null;
    }
  }

  processLoginSuccess() {
    Hooks.doAction("userLoginSuccess");
    this.emit(AUTH_USER_LOGIN_CHANGED);
  }

  processLogoutSuccess() {
    global.document.cookie = CookieUtils.emptyCookieWithExpiry(new Date(1970));

    this.emit(AUTH_USER_LOGOUT_SUCCESS);

    Hooks.doAction("userLogoutSuccess");
  }

  get storeID() {
    return "auth";
  }
}

module.exports = new AuthStore();
