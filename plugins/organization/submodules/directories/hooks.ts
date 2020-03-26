import { Route } from "react-router";
import { i18nMark } from "@lingui/react";

import DirectoriesPage from "./pages/DirectoriesPage";
import { Hooks } from "PluginSDK";

module.exports = {
  configuration: {
    enabled: false,
  },

  appendRoutes(routes) {
    // Find the route we wish to modify, the index route.
    const indexRoute = routes[0].children.find((route) => route.id === "index");

    // Find the settings route within the index route.
    const settingsRouteIndex = indexRoute.children.findIndex(
      (route) => route.path === "settings"
    );

    // Append the directories route to the organization route's children.
    indexRoute.children[settingsRouteIndex].children.push({
      type: Route,
      path: "directory",
      component: DirectoriesPage,
      category: i18nMark("system"),
      isInSidebar: true,
      children: [
        {
          type: Route,
        },
      ],
    });

    return routes;
  },

  initialize() {
    Hooks.addFilter("applicationRoutes", this.appendRoutes.bind(this));
  },
};
