/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { navigation, routing } from "foundation-ui";

import ButtonsPage from "./pages/ButtonsPage";
import ModalsPage from "./pages/ModalsPage";
import TablesPage from "./pages/TablesPage";

const SDK = require("./SDK").getSDK();

const { Icon } = SDK.get(["Icon"]);

module.exports = {
  configuration: {},

  initialize() {
    // The priority is necessary to override the permissions checks
    SDK.Hooks.addFilter(
      "sidebarNavigation",
      this.sidebarNavigation.bind(this),
      9999999
    );
    this.configure(SDK.config);
    this.addRoutes();
  },

  addRoutes() {
    // Primary navigation item
    navigation.NavigationService.registerPrimary(
      "/design-system",
      "Design System",
      {
        category: "root",
        icon: (
          <Icon
            className="sidebar-menu-item-icon icon icon-small"
            id="services-inverse"
            size="small"
            family="product"
          />
        )
      }
    );

    navigation.NavigationService.registerSecondary(
      "/design-system",
      "buttons",
      "Buttons"
    );

    navigation.NavigationService.registerSecondary(
      "/design-system",
      "modals",
      "Modals"
    );

    navigation.NavigationService.registerSecondary(
      "/design-system",
      "tables",
      "Tables"
    );

    routing.RoutingService.registerPage("/design-system/buttons", ButtonsPage);
    routing.RoutingService.registerPage("/design-system/modals", ModalsPage);
    routing.RoutingService.registerPage("/design-system/tables", TablesPage);
    routing.RoutingService.registerRedirect(
      "/design-system",
      "/design-system/buttons"
    );
  },

  configure(configuration) {
    // Only merge keys that have a non-null value
    Object.keys(configuration).forEach(key => {
      if (configuration[key] != null) {
        this.configuration[key] = configuration[key];
      }
    });
  },

  sidebarNavigation(routes) {
    routes.unshift("/design-system");
    return routes;
  }
};
