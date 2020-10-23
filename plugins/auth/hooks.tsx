import { Trans } from "@lingui/macro";
import { MountService } from "foundation-ui";

import * as React from "react";
import { Hooks } from "PluginSDK";

import { Route, hashHistory } from "react-router";

import ApplicationUtil from "#SRC/js/utils/ApplicationUtil";
import AuthStore from "#SRC/js/stores/AuthStore";
import Authenticated from "#SRC/js/components/Authenticated";
import AccessDeniedPage from "#SRC/js/components/AccessDeniedPage";
import Config from "#SRC/js/config/Config";
import CookieUtils from "#SRC/js/utils/CookieUtils";
import * as EventTypes from "#SRC/js/constants/EventTypes";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import RouterUtil from "#SRC/js/utils/RouterUtil";

import { ACL_AUTH_USER_PERMISSIONS_CHANGED } from "./constants/EventTypes";
import ACLAuthenticatedUserStoreFactory from "./stores/ACLAuthenticatedUserStore";
import AuthenticatedClusterDropdown from "./components/AuthenticatedClusterDropdown";
import AuthenticatedUserAccountDropdown from "./components/AuthenticatedUserAccountDropdown";
import LoginPage from "./components/LoginPage";

const API_PERMISSIONS = {
  acsAPI: "dcos:adminrouter:acs",
  metronomeAPI: "dcos:adminrouter:service:metronome",
  metadataAPI: "dcos:adminrouter:ops:metadata",
  marathonAPI: "dcos:adminrouter:service:marathon",
  mesosAPI: "dcos:adminrouter:ops:mesos",
  networkingAPI: "dcos:adminrouter:ops:networking",
  packageAPI: "dcos:adminrouter:package",
  secretsAPI: "dcos:adminrouter:secrets",
  systemHealthAPI: "dcos:adminrouter:ops:system-health",
  uiUpdate: "dcos:adminrouter:ops:dcos-ui-update-service",
};

const SIDEBAR_MENU_MAP = {
  "/dashboard": ["marathonAPI", "systemHealthAPI"],
  "/services": ["marathonAPI"],
  "/jobs": ["metronomeAPI"],
  "/catalog": ["packageAPI"],
  "/nodes": ["mesosAPI"],
  "/networking": ["networkingAPI"],
  "/secrets": ["none"],
  "/cluster": ["superadmin"],
  "/components": ["systemHealthAPI"],
  "/settings": ["superadmin", "acsAPI", "none"],
  "/organization": ["acsAPI"],
};

const MESOS_ACCESS_DENIED_MOUNTS = [
  "ServiceInstancesContainer:TasksContainer",
  "DeclinedOffersTable",
];

export default (SDK) => {
  const ACLAuthenticatedUserStore = ACLAuthenticatedUserStoreFactory(SDK);
  return {
    arePluginsConfigured: false,
    configuration: {
      enabled: false,
    },

    actions: [
      { id: "AJAXRequestError" },
      { id: "pluginsConfigured" },
      { id: "redirectToLogin" },
      { id: "userLoginSuccess" },
      { id: "userLogoutSuccess", priority: 10 },
    ],

    filters: [
      { id: "applicationRoutes" },
      { id: "applicationRedirectRoute" },
      { id: "pluginsLoadedCheck" },
      { id: "shouldIdentifyLoggedInUser" },
      { id: "serverErrorModalListeners" },
      { id: "hasAuthorization" },
      { id: "hasCapability", priority: 15 },
      { id: "sidebarNavigation", priority: 999999 },
      { id: "secondaryNavigation", priority: 999999 },
    ],

    initialize() {
      this.filters.forEach(({ id, priority }) => {
        Hooks.addFilter(id, this[id].bind(this), priority);
      });
      this.actions.forEach(({ id, priority }) => {
        Hooks.addAction(id, this[id].bind(this), priority);
      });
      this.configure(SDK.config);

      this.unregisterMesosDeniedAccess = this.unregisterMesosDeniedAccess.bind(
        this
      );

      this.registerMesosDeniedAccess = this.registerMesosDeniedAccess.bind(
        this
      );

      MesosStateStore.addChangeListener(
        EventTypes.MESOS_STATE_REQUEST_ERROR,
        this.registerMesosDeniedAccess
      );

      this.registerHeaderDropdowns();
      hashHistory.listen(this.handleRouteChange.bind(this));
    },

    configure(configuration) {
      // Only merge keys that have a non-null value
      Object.keys(configuration).forEach((key) => {
        if (configuration[key] != null) {
          this.configuration[key] = configuration[key];
        }
      });
    },

    isEnabled() {
      return this.configuration.enabled;
    },

    pluginsConfigured() {
      this.arePluginsConfigured = true;
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

    registerMesosDeniedAccess(xhr) {
      if (xhr.status === 403) {
        MESOS_ACCESS_DENIED_MOUNTS.forEach((type) => {
          MountService.MountService.registerComponent(
            this.getMesosAccessDeniedMessage,
            type
          );
        });
        // Listen for success to unregister in case permissions change
        MesosStateStore.addChangeListener(
          EventTypes.MESOS_STATE_CHANGE,
          this.unregisterMesosDeniedAccess
        );
        // Unregister access-denied since we've already acted
        MesosStateStore.removeChangeListener(
          EventTypes.MESOS_STATE_REQUEST_ERROR,
          this.registerMesosDeniedAccess
        );
      }
    },

    unregisterMesosDeniedAccess() {
      MESOS_ACCESS_DENIED_MOUNTS.forEach((type) => {
        MountService.MountService.unregisterComponent(
          this.getMesosAccessDeniedMessage,
          type
        );
      });
      // Stop listening for success since we've already acted
      MesosStateStore.removeChangeListener(
        EventTypes.MESOS_STATE_CHANGE,
        this.unregisterMesosDeniedAccess
      );
      // Listen for errors again in case permissions change
      MesosStateStore.addChangeListener(
        EventTypes.MESOS_STATE_REQUEST_ERROR,
        this.registerMesosDeniedAccess
      );
    },

    getMesosAccessDeniedMessage() {
      const message = (
        <Trans render="div">
          You do not have access to this resource. Please contact your{" "}
          {Config.productName} administrator or see{" "}
          <a
            href={MetadataStore.buildDocsURI("/security/ent/iam-api/")}
            target="_blank"
          >
            security documentation
          </a>{" "}
          for more information.
        </Trans>
      );

      return <RequestErrorMsg header="Access Denied" message={message} />;
    },

    locationIsAccessDeniedPage(location) {
      return /^\/access-denied/.test(location);
    },

    locationIsLoginPage(location) {
      return /^\/login/.test(location);
    },

    AJAXRequestError(xhr) {
      if (xhr.status !== 401 && xhr.status !== 403) {
        return;
      }

      const location = window.location.hash.replace(/^#/, "");
      const onAccessDeniedPage = this.locationIsAccessDeniedPage(location);
      const onLoginPage = this.locationIsLoginPage(location);

      // Unauthorized
      if (xhr.status === 401 && !onLoginPage && !onAccessDeniedPage) {
        document.cookie = CookieUtils.emptyCookieWithExpiry(new Date(1970));
        window.location.href = "#/login";
      }

      // TODO: foundation refactor needed
      // If you:
      // 1) Log in with an Identity Provider
      // 2) Have a user with access only to "/services"
      // 3) And access the root path "/"
      //
      // You receive an "Access Denied" page although you should be redirected
      // to the "/services" path. This happens because in the secrets/hooks.js
      // there is a SecretStore.fetchStores(); request that returns a 403 that
      // triggers this AjaxRequestError and shows the access denied page although
      // we're located in the root page "/" that would eventually redirect us to
      // the services page.
      //
      // This area is a patch for: DCOS-19914
      // Reference foundation task: DCOS-19926
      const findFirstAccessibleRoute = this.findFirstAccessibleRoute();
      const isRootPath = location && location.split("?")[0] === "/";

      if (isRootPath && findFirstAccessibleRoute) {
        return;
      }

      // Check if user has access to any of the APIs for the route
      const hasSomeCapabilities = this.authorizedToAccessLocation(location);

      // Forbidden
      if (xhr.status === 403 && !hasSomeCapabilities) {
        window.location.href = "#/access-denied";
      }
    },

    authorizedToAccessLocation(location) {
      const onAccessDeniedPage = this.locationIsAccessDeniedPage(location);
      const onLoginPage = this.locationIsLoginPage(location);

      if (onAccessDeniedPage || onLoginPage) {
        return true;
      }

      const currentRoutePath = Object.keys(SIDEBAR_MENU_MAP).find((route) =>
        location.startsWith(route)
      );

      if (!currentRoutePath) {
        return false;
      }

      return SIDEBAR_MENU_MAP[currentRoutePath].some((api) =>
        Hooks.applyFilter("hasCapability", false, api)
      );
    },

    shouldIdentifyLoggedInUser() {
      return false;
    },

    serverErrorModalListeners(listeners) {
      listeners.push({ name: "auth", events: ["logoutError"] });

      return listeners;
    },

    applicationRoutes(routes) {
      if (this.isEnabled() === true) {
        // Override handler of index to be 'authenticated'
        routes[0].children.forEach((child) => {
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
            type: Route,
          },
          {
            component: LoginPage,
            path: "/login",
            type: Route,
          }
        );
      }

      return routes;
    },

    pluginsLoadedCheck(promiseArray) {
      const permissions = ACLAuthenticatedUserStore.getPermissions();
      // If there's no permissions
      if (Object.keys(permissions).length === 0) {
        const user = AuthStore.getUser();
        if (user) {
          // Create a new promise that needs to be resolved before the app loads
          const promise = new Promise((resolve) => {
            this.fetchPermissionsForUserID(user.uid, resolve);
          });

          promiseArray.push(promise);
        }
      }

      return promiseArray;
    },

    fetchPermissionsForUserID(userID, callback) {
      // Listen to event once, we only care if it was received
      ACLAuthenticatedUserStore.once(ACL_AUTH_USER_PERMISSIONS_CHANGED, () => {
        callback();
        Hooks.doAction("userCapabilitiesFetched");
      });

      // Make request to API
      ACLAuthenticatedUserStore.fetchPermissions(userID);
    },

    applicationRedirectRoute() {
      return this.findFirstAccessibleRoute();
    },

    findFirstAccessibleRoute() {
      const routableItems = {
        "/dashboard": SIDEBAR_MENU_MAP["/dashboard"],
        "/services": SIDEBAR_MENU_MAP["/services"],
        "/jobs": SIDEBAR_MENU_MAP["/jobs"],
        "/nodes": SIDEBAR_MENU_MAP["/nodes"],
        "/catalog": SIDEBAR_MENU_MAP["/catalog"],
        "/networking": SIDEBAR_MENU_MAP["/networking"],
        "/components": ["systemHealthAPI"],
        "/organization": ["acsAPI"],
        "/secrets": ["secretsAPI"],
      };

      const items = this.filterViewableItems(
        routableItems,
        Object.keys(routableItems)
      );

      if (items.length) {
        return items[0];
      }
      // This ensures we route to access denied after login
      return "/access-denied";
    },

    userLoginSuccess() {
      const redirectTo = RouterUtil.getRedirectTo();
      const isValidRedirect = RouterUtil.isValidRedirect(redirectTo);

      if (isValidRedirect) {
        window.location.href = redirectTo;
      } else {
        const user = AuthStore.getUser();
        // We need to fetch permissions before mesos so that
        // we know which endpoint to poll first
        this.fetchPermissionsForUserID(user.uid, () => {
          ApplicationUtil.beginTemporaryPolling(() => {
            const relativePath = RouterUtil.getRelativePath();
            const loginRedirectRoute = AuthStore.get("loginRedirectRoute");

            if (loginRedirectRoute && !relativePath) {
              // Go to redirect route if it is present
              hashHistory.push(loginRedirectRoute);

              return;
            }

            if (relativePath) {
              window.location.replace(
                `${window.location.origin}/#${relativePath}`
              );

              return;
            }

            hashHistory.push(this.findFirstAccessibleRoute());
          });
        });
      }
    },

    userLogoutSuccess() {
      hashHistory.push("/login");

      window.location.reload();
    },

    handleRouteChange({ pathname }) {
      // We can't validate users access if we don't have their permissions yet
      if (!this.arePluginsConfigured) {
        return;
      }

      if (this.locationIsLoginPage(pathname)) {
        return;
      }

      if (!AuthStore.isLoggedIn()) {
        Hooks.doAction(
          "redirectToLogin",
          { location: { pathname } },
          hashHistory.replace
        );

        return;
      }

      const isAuthorized = Hooks.applyFilter(
        "hasAuthorization",
        false,
        pathname
      );

      if (!isAuthorized) {
        hashHistory.push(this.findFirstAccessibleRoute());
      }
    },

    /**
     * Checks if user is authorized to access a path
     * @param  {boolean} bool The previous value of this filter
     * @param  {String} location The path to check
     * @return {boolean} is authorized to access location
     */
    hasAuthorization(bool, location) {
      return this.authorizedToAccessLocation(location);
    },

    hasCapability(bool, capability) {
      if (!capability) {
        return false;
      }

      if (capability === "none") {
        return true;
      }

      const permissions = ACLAuthenticatedUserStore.getPermissions();
      // Super users have access to everything
      if (permissions["dcos:superuser"]) {
        return true;
      }

      return (
        capability in API_PERMISSIONS &&
        !!permissions[API_PERMISSIONS[capability]]
      );
    },

    filterViewableItems(constraintMap, filterableArray) {
      const hasCapability = Hooks.applyFilter.bind(
        Hooks,
        "hasCapability",
        false
      );

      // Filter out any menu items that don't exist
      // This will happen when some plugins aren't enabled
      constraintMap = Object.keys(constraintMap).reduce((memo, constraint) => {
        if (filterableArray.indexOf(constraint) === -1) {
          if (Config.environment === "development") {
            console.warn(`${constraint} doesn't exist.`);
          }
        } else {
          memo[constraint] = constraintMap[constraint];
        }

        return memo;
      }, {});

      return Object.keys(constraintMap).reduce((filteredItems, constraint) => {
        // Only need to match one of the permissions
        if (constraintMap[constraint].some(hasCapability)) {
          filteredItems.push(constraint);
        }

        return filteredItems;
      }, []);
    },

    registerHeaderDropdowns() {
      MountService.MountService.registerComponent(
        AuthenticatedUserAccountDropdown,
        "Header:UserAccountDropdown",
        100
      );
      MountService.MountService.registerComponent(
        AuthenticatedClusterDropdown,
        "Header:ClusterDropdown",
        100
      );
    },

    // Menu Handling
    sidebarNavigation(menuItems) {
      const filteredMenu = this.filterViewableItems(
        SIDEBAR_MENU_MAP,
        menuItems
      );

      if (filteredMenu.length === 0) {
        // This will ensure we redirect on reload of page
        setTimeout(() => {
          window.location.href = "/#/access-denied";
        });
      }

      return filteredMenu;
    },

    secondaryNavigation(tabs, parentPath) {
      if (parentPath === "/settings") {
        const tabMap = {
          "/settings/ui-settings": ["none"],
          "/settings/repositories": ["superadmin"],
          "/settings/stores": ["superadmin"],
          "/settings/identity-providers": ["acsAPI"],
          "/settings/directory": ["acsAPI"],
        };

        return this.filterViewableItems(tabMap, tabs);
      }

      return tabs;
    },
  };
};
