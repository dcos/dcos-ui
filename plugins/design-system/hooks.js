/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { navigation, routing } from "foundation-ui";

import ButtonsPage from "./pages/buttons/ButtonsPage";
import IntroductionPage from "./pages/IntroductionPage";
import ModalsPage from "./pages/ModalsPage";
import OverviewTab from "./pages/buttons/OverviewTab";
import CodeTab from "./pages/buttons/CodeTab";
import StylesTab from "./pages/buttons/StylesTab";
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
    navigation.NavigationService.registerCategory("design system");

    navigation.NavigationService.registerPrimary(
      "/ds-introduction",
      "Introduction",
      {
        category: "design system",
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

    navigation.NavigationService.registerPrimary(
      "/ds-components",
      "Components",
      {
        category: "design system",
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
      "/ds-components",
      "buttons",
      "Buttons"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-components",
      "modals",
      "Modals"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-components",
      "tables",
      "Tables"
    );

    routing.RoutingService.registerPage("/ds-components/buttons", ButtonsPage);
    routing.RoutingService.registerPage("/ds-components/modals", ModalsPage);
    routing.RoutingService.registerPage("/ds-components/tables", TablesPage);

    routing.RoutingService.registerTab(
      "/ds-components/buttons",
      "overview",
      OverviewTab
    );

    routing.RoutingService.registerTab(
      "/ds-components/buttons",
      "code",
      CodeTab
    );

    routing.RoutingService.registerTab(
      "/ds-components/buttons",
      "styles",
      StylesTab
    );

    routing.RoutingService.registerRedirect(
      "/ds-components/buttons",
      "/ds-components/buttons/overview"
    );

    routing.RoutingService.registerPage("/ds-introduction", IntroductionPage);
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
    return routes.concat(["/ds-introduction"], ["/ds-components"]);
  }
};
