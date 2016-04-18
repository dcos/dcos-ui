/*eslint-disable no-unused-vars*/
import React from 'react';
/*eslint-enable no-unused-vars*/
import {Route} from 'react-router';

import {
  CONFIG_ERROR,
  CONFIG_LOADED
} from './constants/EventTypes';

import LoginPage from './components/LoginPage';
import UserDropup from './components/UserDropup';

let SDK = require('./SDK').getSDK();

let {AccessDeniedPage, Authenticated, ConfigStore, CookieUtils} = SDK.get([
  'AccessDeniedPage', 'Authenticated', 'ConfigStore', 'CookieUtils']);

// DCOS-5935 Build mixin for non-react components to listen to store events
const CONFIG_STORE_LISTENERS = [CONFIG_LOADED, CONFIG_ERROR];

function reloadConfigStore(callback) {
  let handler = function () {
    CONFIG_STORE_LISTENERS.forEach(event => {
      ConfigStore.removeChangeListener(event, handler);
    });

    callback();
  };

  CONFIG_STORE_LISTENERS.forEach(event => {
    ConfigStore.addChangeListener(event, handler);
  });

  ConfigStore.fetchConfig();
}

module.exports = {
  actions: [
    'AJAXRequestError',
    'userLogoutSuccess',
    'redirectToLogin'
  ],

  filters: [
    'sidebarFooter',
    'applicationRoutes',
    'serverErrorModalListeners'
  ],

  initialize() {
    this.filters.forEach(filter => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });
  },

  redirectToLogin(transition) {
    transition.redirect('/login');
  },

  AJAXRequestError(xhr) {
    if (xhr.status !== 401 && xhr.status !== 403) {
      return;
    }

    let location = global.location.hash;
    let onAccessDeniedPage = /access-denied/.test(location);
    let onLoginPage = /login/.test(location);

    // Unauthorized
    if (xhr.status === 401 && !onLoginPage && !onAccessDeniedPage) {
      global.document.cookie = CookieUtils.emptyCookieWithExpiry(new Date(1970));
      global.location.href = '#/login';
    }

    // Forbidden
    if (xhr.status === 403 && !onLoginPage && !onAccessDeniedPage) {
      global.location.href = '#/access-denied';
    }
  },

  sidebarFooter(value, defaultButtonSet) {
    let buttonSet = defaultButtonSet;
    if (value && value.props.children) {
      buttonSet = value.props.children;
    }

    return (
      <UserDropup items={buttonSet} />
    );
  },

  serverErrorModalListeners(listeners) {
    listeners.push({
      name: 'auth',
      events: ['logoutError']
    });

    return listeners;
  },

  applicationRoutes(routes) {
    // Override handler of index to be 'authenticated'
    routes[0].children.forEach(function (child) {
      if (child.id === 'index') {
        child.handler = new Authenticated(child.handler);
      }
    });

    // Add access denied and login pages
    routes[0].children.unshift(
      {
        type: Route,
        name: 'access-denied',
        path: 'access-denied',
        handler: AccessDeniedPage
      },
      {
        handler: LoginPage,
        name: 'login',
        path: 'login',
        type: Route
      }
    );
    return routes;
  },

  userLogoutSuccess() {
    // Reload configuration because we need to get 'firstUser' which is
    // dynamically set based on number of users
    reloadConfigStore(this.navigateToLoginPage);
  },

  navigateToLoginPage() {
    window.location.href = '#/login';
  }
};
