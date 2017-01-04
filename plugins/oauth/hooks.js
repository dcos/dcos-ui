/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Redirect, Route, hashHistory} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import LoginPage from './components/LoginPage';

const SDK = require('./SDK').getSDK();

const {
  AccessDeniedPage,
  ApplicationUtil,
  Authenticated,
  AuthStore,
  ConfigStore,
  CookieUtils,
  RouterUtil,
  UsersPage
} = SDK.get([
  'AccessDeniedPage',
  'ApplicationUtil',
  'AuthStore',
  'Authenticated',
  'ConfigStore',
  'CookieUtils',
  'RouterUtil',
  'UsersPage'
]);

let configResponseCallback = null;
const defaultOrganizationRoute = {
  routes: []
};

module.exports = Object.assign({}, StoreMixin, {
  actions: [
    'AJAXRequestError',
    'userLoginSuccess',
    'userLogoutSuccess',
    'redirectToLogin'
  ],

  filters: [
    'applicationRoutes',
    'delayApplicationLoad',
    'dcosInstallCommandExtraSteps',
    'organizationRoutes',
    'userDropdownItems',
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

  dcosInstallCommandExtraSteps() {
    // Inject additional steps into the CLI install instructions
    return 'dcos auth login';
  },

  redirectToLogin(nextState, replace) {
    replace('/login');
  },

  AJAXRequestError(xhr) {
    if (xhr.status !== 401) {
      return;
    }

    const location = global.location.hash;
    const onAccessDeniedPage = /access-denied/.test(location);
    const onLoginPage = /login/.test(location);

    // Unauthorized
    if (xhr.status === 401 && !onLoginPage && !onAccessDeniedPage) {
      global.document.cookie = CookieUtils.emptyCookieWithExpiry(new Date(1970));
      global.location.href = '#/login';
    }
  },

  serverErrorModalListeners(listeners) {
    listeners.push({
      name: 'auth',
      events: ['logoutError']
    });

    return listeners;
  },

  userDropdownItems(defaultMenuItems) {
    const menuItems = defaultMenuItems.slice();
    const user = AuthStore.getUser();

    let userLabel = null;

    if (user && !user.is_remote) {
      userLabel = user.description;
    } else if (user && user.is_remote) {
      userLabel = user.uid;
    }

    menuItems.push(
      {
        className: 'dropdown-menu-section-header',
        html: <label>User</label>,
        id: 'header-b',
        selectable: false
      },
      {
        html: <div className="text-overflow">{userLabel}</div>,
        id: 'username',
        selectable: false
      },
      {
        html: 'Sign Out',
        id: 'sign-out',
        onClick: AuthStore.logout
      }
    );

    return menuItems;
  },

  applicationRoutes(routes) {
    // Override handler of index to be 'authenticated'
    routes[0].children.forEach(function (child) {
      if (child.id === 'index') {
        child.component = new Authenticated(child.component);
        child.onEnter = child.component.willTransitionTo;
      }
    });

    // Add access denied and login pages
    routes[0].children.unshift(
      {
        component: AccessDeniedPage,
        path: '/access-denied',
        type: Route
      },
      {
        component: LoginPage,
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
    const userRoute = {
      type: Route,
      path: 'users',
      component: UsersPage,
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
    const usersRouteIndex = routeDefinition.routes.findIndex(function (route) {
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

  userLoginSuccess() {
    const redirectTo = RouterUtil.getRedirectTo();

    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      ApplicationUtil.beginTemporaryPolling(() => {
        const loginRedirectRoute = AuthStore.get('loginRedirectRoute');

        if (loginRedirectRoute) {
          // Go to redirect route if it is present
          hashHistory.push(loginRedirectRoute);
        } else {
          // Go to home
          hashHistory.push('/');
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
    const user = AuthStore.getUser();

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
