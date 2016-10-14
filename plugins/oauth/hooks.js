/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Redirect, Route} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import LoginPage from './components/LoginPage';

let SDK = require('./SDK').getSDK();

let {
  AccessDeniedPage,
  ApplicationUtil,
  Authenticated,
  AuthStore,
  ConfigStore,
  CookieUtils,
  RouterUtil,
  UserDropup,
  UsersTab
} = SDK.get([
  'AccessDeniedPage',
  'ApplicationUtil',
  'AuthStore',
  'Authenticated',
  'ConfigStore',
  'CookieUtils',
  'RouterUtil',
  'UserDropup',
  'UsersTab'
]);

let configResponseCallback = null;
let defaultOrganizationRoute = {
  routes: []
};

module.exports = Object.assign({}, StoreMixin, {
  actions: [
    'AJAXRequestError',
    'applicationRouter',
    'userLoginSuccess',
    'userLogoutSuccess',
    'redirectToLogin'
  ],

  filters: [
    'applicationRoutes',
    'delayApplicationLoad',
    'organizationRoutes',
    'sidebarFooter',
    'system-organization-tabs',
    'serverErrorModalListeners'
  ],

  initialize() {
    this.filters.forEach((filter) => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });
    this.actions.forEach((action) => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });
    this.store_initializeListeners([{
      name: 'config',
      events: ['success', 'error']
    }]);
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

  applicationRouter(router) {
    this.applicationRouter = router;
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
        handler: AccessDeniedPage,
        path: '/access-denied',
        type: Route
      },
      {
        handler: LoginPage,
        path: '/login',
        type: Route
      }
    );
    return routes;
  },

  onConfigStoreSuccess() {
    if (configResponseCallback) {
      configResponseCallback();
      configResponseCallback = null;
    }
  },

  onConfigStoreError() {
    if (configResponseCallback) {
      configResponseCallback();
      configResponseCallback = null;
    }
  },

  // Ensure user route under organization
  organizationRoutes(routeDefinition = defaultOrganizationRoute) {
    let userRoute = {
      type: Route,
      path: 'users',
      handler: UsersTab,
      buildBreadCrumb() {
        return {
          parentCrumb: '/organization',
          getCrumbs() {
            return [
              {
                label: 'Users',
                route: {to: '/organization/users'}
              }
            ];
          }
        };
      }
    };
    let usersRouteIndex = routeDefinition.routes.findIndex(function (route) {
      return route.name === userRoute.name;
    });
    // Replace by new definition
    if (usersRouteIndex !== -1) {
      routeDefinition.routes.splice(usersRouteIndex, 1, userRoute);
    }

    // Add user route if not already present
    if (usersRouteIndex === -1) {
      routeDefinition.routes.push(userRoute);
    }

    routeDefinition.redirect = {
      type: Redirect,
      from: '/organization',
      to: '/organization/users'
    };

    return routeDefinition;
  },

  'system-organization-tabs': function (tabs) {
    return Object.assign({}, tabs, {
      '/organization/users': {
        content: 'Users',
        priority: 50
      }
    });
  },

  userLoginSuccess() {
    let redirectTo = RouterUtil.getRedirectTo();

    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      ApplicationUtil.beginTemporaryPolling(() => {
        let loginRedirectRoute = AuthStore.get('loginRedirectRoute');

        if (loginRedirectRoute) {
          // Go to redirect route if it is present
          this.applicationRouter.transitionTo(loginRedirectRoute);
        } else {
          // Go to home
          this.applicationRouter.transitionTo('/');
        }
      });
    }
  },

  userLogoutSuccess() {
    // Reload configuration because we need to get 'firstUser' which is
    // dynamically set based on number of users
    configResponseCallback = this.navigateToLoginPage;
    ConfigStore.fetchConfig();
  },

  delayApplicationLoad(value) {
    let user = AuthStore.getUser();

    // If user is logged in, then let's let the app do its thing
    if (user) {
      return value;
    }

    // Let's wait till login and then we'll request mesos summary before render
    return false;
  },

  navigateToLoginPage() {
    window.location.href = '#/login';
  }
});
