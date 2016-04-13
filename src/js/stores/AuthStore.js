import {Store} from 'mesosphere-shared-reactjs';

import {
  REQUEST_LOGIN_SUCCESS,
  REQUEST_LOGIN_ERROR,
  REQUEST_LOGOUT_SUCCESS,
  REQUEST_LOGOUT_ERROR,
  SERVER_ACTION
} from '../constants/ActionTypes';

import {
  AUTH_USER_LOGIN_CHANGED,
  AUTH_USER_LOGOUT_SUCCESS,
  AUTH_USER_LOGIN_ERROR,
  AUTH_USER_LOGOUT_ERROR
} from '../constants/EventTypes';

import AppDispatcher from '../events/AppDispatcher';
import AuthActions from '../events/AuthActions';
import CookieUtils from '../utils/CookieUtils';
import GetSetMixin from '../mixins/GetSetMixin';
import {Hooks} from 'PluginSDK';

let AuthStore = Store.createStore({
  storeID: 'auth',

  mixins: [GetSetMixin],

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  login: AuthActions.login,

  logout: AuthActions.logout,

  isLoggedIn: function () {
    return !!CookieUtils.getUserMetadata();
  },

  getUser: function () {
    let userCode = CookieUtils.getUserMetadata();

    if (userCode == null) {
      return null;
    }

    try {
      return JSON.parse(atob(userCode));
    } catch (err) {
      return null;
    }
  },

  processLoginSuccess() {
    Hooks.doAction('processLoginSuccess');
    this.emit(AUTH_USER_LOGIN_CHANGED);
  },

  processLogoutSuccess: function () {
    global.document.cookie = CookieUtils.emptyCookieWithExpiry(new Date(1970));

    this.emit(AUTH_USER_LOGOUT_SUCCESS);

    Hooks.doAction('userLogoutSuccess');
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case REQUEST_LOGIN_SUCCESS:
        AuthStore.processLoginSuccess();
        break;
      case REQUEST_LOGIN_ERROR:
        AuthStore.emit(AUTH_USER_LOGIN_ERROR, action.data, action.xhr);
        break;
      case REQUEST_LOGOUT_SUCCESS:
        AuthStore.processLogoutSuccess();
        break;
      case REQUEST_LOGOUT_ERROR:
        AuthStore.emit(AUTH_USER_LOGOUT_ERROR, action.data);
        break;
    }

    return true;
  })

});

module.exports = AuthStore;
