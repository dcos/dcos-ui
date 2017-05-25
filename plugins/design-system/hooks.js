/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { navigation, routing } from "foundation-ui";

import IntroductionPage from "./pages/IntroductionPage";
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

import BadgesRoute from "./routes/elements/badges";
import BannersRoute from "./routes/elements/banners";
import BreadcrumbsRoute from "./routes/elements/breadcrumbs";
import ButtonGroupsRoute from "./routes/elements/button-groups";
import ButtonsRoute from "./routes/elements/buttons";
import ChartsRoute from "./routes/elements/charts";
import CheckboxesRoute from "./routes/elements/checkboxes";
import DropdownsRoute from "./routes/elements/dropdowns";
import LoadingIndidactorsRoute from "./routes/elements/loading-indicators";
import MessagesRoute from "./routes/elements/messages";
import ModalsRoute from "./routes/elements/modals";
import PanelsRoute from "./routes/elements/panels";
import RadioButtonsRoute from "./routes/elements/radio-buttons";
import SegmentedBarsRoute from "./routes/elements/segmented-bars";
import SelectsRoute from "./routes/elements/selects";
import TablesRoute from "./routes/elements/tables";
import TabsRoute from "./routes/elements/tabs";
import TextFieldsRoute from "./routes/elements/text-fields";
import TogglesRoute from "./routes/elements/toggles";
import TooltipsRoute from "./routes/elements/tooltips";
import TypeRoute from "./routes/elements/type";

const SDK = require("./SDK").getSDK();

const { Icon } = SDK.get(["Icon"]);

module.exports = {
  configuration: {},
  category: "design system",
  sideBar: {
    introduction: {
      name: "Introduction",
      path: "/ds-introduction",
      page: IntroductionPage
    },
    style: {
      name: "Style",
      path: "/ds-style",
      pages: [
        {
          name: "Color",
          path: "color",
          page: ColorPage
        },
        {
          name: "Icons",
          path: "icons",
          page: IconsPage
        },
        {
          name: "Layout",
          path: "layout",
          page: LayoutPage
        },
        {
          name: "Motion",
          path: "motion",
          page: MotionPage
        },
        {
          name: "Typography",
          path: "typography",
          page: TypographyPage
        },
        {
          name: "Writing",
          path: "writing",
          page: WritingPage
        }
      ]
    },
    components: {
      name: "Components",
      path: "/ds-components"
    },
    patterns: {
      name: "Patterns",
      path: "/ds-patterns",
      pages: [
        {
          name: "Create/Edit",
          path: "create-edit",
          page: CreateEditPage
        },
        {
          name: "Empty States",
          path: "empty-states",
          page: EmptyStatesPage
        },
        {
          name: "Help & Feedback",
          path: "help-feedback",
          page: HelpFeedbackPage
        },
        {
          name: "Forms",
          path: "forms",
          page: FormsPage
        },
        {
          name: "Loading",
          path: "loading",
          page: LoadingPage
        },
        {
          name: "Notifications",
          path: "notifications",
          page: NotificationsPage
        },
        {
          name: "Validation",
          path: "validation",
          page: ValidationPage
        }
      ]
    }
  },
  componentRoutes: [
    BadgesRoute,
    BannersRoute,
    BreadcrumbsRoute,
    ButtonGroupsRoute,
    ButtonsRoute,
    ChartsRoute,
    CheckboxesRoute,
    DropdownsRoute,
    LoadingIndidactorsRoute,
    MessagesRoute,
    ModalsRoute,
    PanelsRoute,
    RadioButtonsRoute,
    SegmentedBarsRoute,
    SelectsRoute,
    TablesRoute,
    TabsRoute,
    TextFieldsRoute,
    TogglesRoute,
    TooltipsRoute,
    TypeRoute
  ],

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
    navigation.NavigationService.registerCategory(this.category);

    // Primary routes are top-level elements in the sidebar.
    // In the following call to #registerPrimary, we provide the route path to
    // link to, the display label and an object of options. The object of
    // options contains the category that this entry belongs to and the icon
    // that should be displayed.
    navigation.NavigationService.registerPrimary(
      this.sideBar.introduction.path,
      this.sideBar.introduction.name,
      {
        category: this.category,
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
      this.sideBar.style.path,
      this.sideBar.style.name,
      {
        category: this.category,
        icon: (
          <Icon
            className="sidebar-menu-item-icon icon icon-small"
            id="servers-inverse"
            size="small"
            family="product"
          />
        )
      }
    );

    navigation.NavigationService.registerPrimary(
      this.sideBar.components.path,
      this.sideBar.components.name,
      {
        category: this.category,
        icon: (
          <Icon
            className="sidebar-menu-item-icon icon icon-small"
            id="components-inverse"
            size="small"
            family="product"
          />
        )
      }
    );

    navigation.NavigationService.registerPrimary(
      this.sideBar.patterns.path,
      this.sideBar.patterns.name,
      {
        category: this.category,
        icon: (
          <Icon
            className="sidebar-menu-item-icon icon icon-small"
            id="packages-inverse"
            size="small"
            family="product"
          />
        )
      }
    );

    // Secondary routes appear nested underneath their parent.
    // In the following call to #registerSecondary, we provide the parent route,
    // the child route, and the display label.

    // Register the routes for each child in the style sidebar
    this.sideBar.style.pages.forEach(function(page) {
      navigation.NavigationService.registerSecondary(
        this.sideBar.style.path,
        page.path,
        page.name
      );
    }, this);

    // Register the routes for each child in the patterns sidebar
    this.sideBar.patterns.pages.forEach(function(page) {
      navigation.NavigationService.registerSecondary(
        this.sideBar.patterns.path,
        page.path,
        page.name
      );
    }, this);

    // The following calls to #registerPage define which components should be
    // rendered for the given top-level routes.
    routing.RoutingService.registerPage(
      this.sideBar.introduction.path,
      this.sideBar.introduction.page
    );

    // Register the pages for the style sidebar
    this.sideBar.style.pages.forEach(function(page) {
      routing.RoutingService.registerPage(
        `${this.sideBar.style.path}/${page.path}`,
        page.page
      );
    }, this);

    // Register the pages for the patterns sidebar
    this.sideBar.patterns.pages.forEach(function(page) {
      routing.RoutingService.registerPage(
        `${this.sideBar.patterns.path}/${page.path}`,
        page.page
      );
    }, this);

    // Register the routes for each UI component for the components sidebar
    this.componentRoutes.forEach(function(component) {
      component.addRoutes();
    });
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
      this.sideBar.introduction.path,
      this.sideBar.style.path,
      this.sideBar.components.path,
      this.sideBar.patterns.path
    ].concat(routes);
  }
};
