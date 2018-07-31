import { MountService } from "foundation-ui";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Redirect, Route, hashHistory } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import AccessDeniedPage from "#SRC/js/components/AccessDeniedPage";
import ApplicationUtil from "#SRC/js/utils/ApplicationUtil";
import Authenticated from "#SRC/js/components/Authenticated";
import AuthStore from "#SRC/js/stores/AuthStore";
import ConfigStore from "#SRC/js/stores/ConfigStore";
import CookieUtils from "#SRC/js/utils/CookieUtils";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import UsersPage from "#SRC/js/pages/system/UsersPage";

import AuthenticatedUserAccountDropdown from "./components/AuthenticatedUserAccountDropdown";
import LoginPage from "./components/LoginPage";

const SDK = require("./SDK").getSDK();

let configResponseCallback = null;
const defaultOrganizationRoute = {
  routes: []
};

module.exports = Object.assign({}, StoreMixin, {
  actions: [
    "AJAXRequestError",
    "userLoginSuccess",
    "userLogoutSuccess",
    "redirectToLogin"
  ],

  filters: [
    "applicationRoutes",
    "delayApplicationLoad",
    "organizationRoutes",
    "serverErrorModalListeners",
    "userAddPolicy"
  ],

  initialize() {
    this.filters.forEach(filter => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });
    this.store_initializeListeners([
      {
        name: "config",
        events: ["success", "error"]
      }
    ]);

    this.registerUserAccountDropdown();
  },

  redirectToLogin(nextState, replace) {
    const redirectTo = RouterUtil.getRedirectTo();
    // Ignores relative path if redirect is present
    if (redirectTo) {
      replace(`/login?redirect=${redirectTo}`);
    } else {
      replace(`/login?relativePath=${nextState.location.pathname}`);
    }
  },

  AJAXRequestError(xhr) {
    if (xhr.status !== 401 && xhr.status !== 403) {
      return;
    }

    const location = global.location.hash;
    const onAccessDeniedPage = /access-denied/.test(location);
    const onLoginPage = /login/.test(location);

    // Unauthorized
    if (xhr.status === 401 && !onLoginPage && !onAccessDeniedPage) {
      global.document.cookie = CookieUtils.emptyCookieWithExpiry(
        new Date(1970)
      );
      global.location.href = "#/login";
    }

    // Forbidden
    if (xhr.status === 403 && !onLoginPage && !onAccessDeniedPage) {
      global.location.href = "#/access-denied";
    }
  },

  serverErrorModalListeners(listeners) {
    listeners.push({
      name: "auth",
      events: ["logoutError"]
    });

    return listeners;
  },

  applicationRoutes(routes) {
    // Override handler of index to be 'authenticated'
    routes[0].children.forEach(function(child) {
      if (child.id === "index") {
        child.component = new Authenticated(child.component);
        child.onEnter = child.component.willTransitionTo;
      }
    });

    // Add access denied and login pages
    routes[0].children.unshift(
      {
        component: AccessDeniedPage,
        path: "/access-denied",
        type: Route
      },
      {
        component: LoginPage,
        path: "/login",
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
      path: "users",
      component: UsersPage
    };
    const usersRouteIndex = routeDefinition.routes.findIndex(function(route) {
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
      from: "/organization",
      to: "/organization/users"
    };

    return routeDefinition;
  },

  registerUserAccountDropdown() {
    MountService.MountService.registerComponent(
      AuthenticatedUserAccountDropdown,
      "Header:UserAccountDropdown",
      100
    );
  },

  userLoginSuccess() {
    const redirectTo = RouterUtil.getRedirectTo();
    const isValidRedirect = RouterUtil.isValidRedirect(redirectTo);

    if (isValidRedirect) {
      global.location.href = redirectTo;
    } else {
      ApplicationUtil.beginTemporaryPolling(() => {
        const relativePath = RouterUtil.getRelativePath();
        const loginRedirectRoute = AuthStore.get("loginRedirectRoute");

        if (loginRedirectRoute && !relativePath) {
          // Go to redirect route if it is present
          hashHistory.push(loginRedirectRoute);
        } else if (relativePath) {
          global.location.replace(`${global.location.origin}/#${relativePath}`);
        } else {
          // Go to home
          hashHistory.push("/");
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
    global.location.href = "#/login";
  },

  userAddPolicy() {
    return (
      <p className="form-control-feedback">
        By adding a user you understand we will process personal information in
        accordance with our{" "}
        <a
          className="reset-color"
          href="https://mesosphere.com/privacy/"
          target="_blank"
        >
          Privacy Policy
        </a>.
      </p>
    );
  }
});
