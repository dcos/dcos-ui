/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { navigation, routing } from "foundation-ui";

import ButtonsPage from "./pages/elements/buttons/ButtonsPage";
import IntroductionPage from "./pages/IntroductionPage";
import ModalsPage from "./pages/elements/modals/ModalsPage";
import TablesPage from "./pages/elements/tables/TablesPage";
import ColorPage from "./pages/style/ColorPage";
import CreateEditPage from "./pages/patterns/CreateEditPage";
import EmptyStatesPage from "./pages/patterns/EmptyStatesPage";
import FormsPage from "./pages/patterns/FormsPage";
import HelpFeedbackPage from "./pages/patterns/HelpFeedbackPage";
import IconsPage from "./pages/style/IconsPage";
import LayoutPage from "./pages/style/LayoutPage";
import LoadingPage from "./pages/patterns/LoadingPage";
import MotionPage from "./pages/style/MotionPage";
import NotificationsPage from "./pages/patterns/NotificationsPage";
import TypographyPage from "./pages/style/TypographyPage";
import ValidationPage from "./pages/patterns/ValidationPage";
import WritingPage from "./pages/style/WritingPage";

import OverviewTab from "./pages/elements/buttons/tabs/OverviewTab";
import CodeTab from "./pages/elements/buttons/tabs/CodeTab";
import StylesTab from "./pages/elements/buttons/tabs/StylesTab";

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

    navigation.NavigationService.registerPrimary("/ds-style", "Style", {
      category: "design system",
      icon: (
        <Icon
          className="sidebar-menu-item-icon icon icon-small"
          id="services-inverse"
          size="small"
          family="product"
        />
      )
    });

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

    navigation.NavigationService.registerPrimary("/ds-patterns", "Patterns", {
      category: "design system",
      icon: (
        <Icon
          className="sidebar-menu-item-icon icon icon-small"
          id="services-inverse"
          size="small"
          family="product"
        />
      )
    });

    // Secondary routes appear nested underneath their parent.
    // In the following call to #registerSecondary, we provide the parent route,
    // the child route, and the display label.

    // Style
    navigation.NavigationService.registerSecondary(
      "/ds-style",
      "color",
      "Color"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-style",
      "icons",
      "Icons"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-style",
      "layout",
      "Layout"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-style",
      "motion",
      "Motion"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-style",
      "typography",
      "Typography"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-style",
      "writing",
      "Writing"
    );

    // Components
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

    // Patterns
    navigation.NavigationService.registerSecondary(
      "/ds-patterns",
      "create-edit",
      "Create/Edit"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-patterns",
      "empty-states",
      "Empty States"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-patterns",
      "help-feedback",
      "Help & Feedback"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-patterns",
      "forms",
      "Forms"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-patterns",
      "loading",
      "Loading"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-patterns",
      "notifications",
      "Notifications"
    );

    navigation.NavigationService.registerSecondary(
      "/ds-patterns",
      "validation",
      "Validation"
    );

    // The following calls to #registerPage define which components should be
    // rendered for the given top-level routes.
    routing.RoutingService.registerPage("/ds-introduction", IntroductionPage);

    routing.RoutingService.registerPage("/ds-style/color", ColorPage);

    routing.RoutingService.registerPage("/ds-style/icons", IconsPage);

    routing.RoutingService.registerPage("/ds-style/layout", LayoutPage);

    routing.RoutingService.registerPage("/ds-style/motion", MotionPage);

    routing.RoutingService.registerPage("/ds-style/typography", TypographyPage);

    routing.RoutingService.registerPage("/ds-style/writing", WritingPage);

    routing.RoutingService.registerPage("/ds-components/buttons", ButtonsPage);

    routing.RoutingService.registerPage("/ds-components/modals", ModalsPage);

    routing.RoutingService.registerPage("/ds-components/tables", TablesPage);

    routing.RoutingService.registerPage("/ds-patterns/forms", FormsPage);

    routing.RoutingService.registerPage("/ds-patterns/loading", LoadingPage);

    routing.RoutingService.registerPage(
      "/ds-patterns/create-edit",
      CreateEditPage
    );

    routing.RoutingService.registerPage(
      "/ds-patterns/empty-states",
      EmptyStatesPage
    );

    routing.RoutingService.registerPage(
      "/ds-patterns/help-feedback",
      HelpFeedbackPage
    );

    routing.RoutingService.registerPage(
      "/ds-patterns/notifications",
      NotificationsPage
    );

    routing.RoutingService.registerPage(
      "/ds-patterns/validation",
      ValidationPage
    );

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
    return [
      "/ds-introduction",
      "/ds-style",
      "/ds-components",
      "/ds-patterns"
    ].concat(routes);
  }
};
