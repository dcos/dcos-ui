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

  /**
   * Using the NavigationService and RoutingService, we add all of our routes to
   * the app here.
   *
   * The NavigationService provides method to define how an entry in the sidebar
   * should be displayed.
   */
  addRoutes() {
    // Categories are used by the Sidebar to group navigation elements together.
    navigation.NavigationService.registerCategory("design system");

    // Primary routes are top-level elements in the sidebar.
    // In the following call to #registerPrimary, we provide the route path to
    // link to, the display label and an object of options. The object of
    // options contains the category that this entry belongs to and the icon
    // that should be displayed.
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

    // Secondary routes appear nested underneath their parent.
    // In the following call to #registerSecondary, we provide the parent route,
    // the child route, and the display label.
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

    // The following calls to #registerPage define which components should be
    // rendered for the given top-level routes.
    routing.RoutingService.registerPage("/ds-introduction", IntroductionPage);
    routing.RoutingService.registerPage("/ds-components/buttons", ButtonsPage);
    routing.RoutingService.registerPage("/ds-components/modals", ModalsPage);
    routing.RoutingService.registerPage("/ds-components/tables", TablesPage);

    // The following calls to #registerTab define child routes for each page.
    // We provide the parent route, the child route, and the component to be
    // rendered.
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

    // Redirects should be rendered after all of the associated routes have been
    // defined.
    routing.RoutingService.registerRedirect(
      "/ds-components/buttons",
      "/ds-components/buttons/overview"
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

  /**
   * We need to add all of our top-level routes via the sidebarNavigaiton
   * fulter.
   *
   * @param  {array} routes - The existing array of routes.
   * @return {array} - The same array with our additonal routes added to the
   *   beginning.
   */
  sidebarNavigation(routes) {
    return ["/ds-introduction", "/ds-components"].concat(routes);
  }
};
