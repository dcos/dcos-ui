import * as React from "react";

import { Route } from "react-router";
import { i18nMark } from "@lingui/react";

import AuthProvidersTab from "./pages/AuthProvidersTab";
import LoginModalProviders from "./components/LoginModalProviders";

const SDK = require("./SDK").getSDK();

module.exports = {
  actions: [],

  filters: ["loginModalContent", "applicationRoutes"],

  initialize() {
    this.filters.forEach((filter) => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });
    this.actions.forEach((action) => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });
  },

  applicationRoutes(routes) {
    // Find the route we wish to modify, the index route.
    const indexRoute = routes[0].children.find((route) => route.id === "index");

    // Find the settings route within the index route.
    const settingsRouteIndex = indexRoute.children.findIndex(
      (route) => route.path === "settings"
    );

    // Append the identity providers route to the settings route's children.
    indexRoute.children[settingsRouteIndex].children.push({
      type: Route,
      path: "identity-providers",
      component: AuthProvidersTab,
      category: i18nMark("system"),
      isInSidebar: true,
      children: [
        {
          type: Route,
          path: ":providerType/:providerID",
        },
      ],
    });

    return routes;
  },

  loginModalContent(previousContent, updateHandler) {
    return <LoginModalProviders onUpdate={updateHandler} />;
  },
};
