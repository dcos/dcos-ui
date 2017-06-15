import React from "react";
import { NavigationService } from "../../../foundation-ui/navigation";
import Config from "../config/Config";

const NavigationServiceUtil = {
  /**
   * registerRoutesInNavigation - declares Navigation Elements based on routes using
   * NavigationService API
   *
   * @param  {Array} routes Application routes
   * @return {undefined}
   */
  registerRoutesInNavigation(routes) {
    if (Config.environment === "development") {
      console.warn(
        "DEPRECATED: All navigation elements should register " +
          "with the NavigationService"
      );
    }

    const indexRoute = routes.find(route => route.id === "index");

    if (!indexRoute) {
      return;
    }

    indexRoute.childRoutes
      .filter(({ isInSidebar }) => isInSidebar)
      .forEach(function(route) {
        const { path, category, childRoutes = [] } = route;
        const primaryPath = `/${path}`;

        NavigationService.registerCategory(category);

        const icon = React.cloneElement(route.component.routeConfig.icon, {
          className: "sidebar-menu-item-icon icon icon-small"
        });

        NavigationService.registerPrimary(
          primaryPath,
          route.component.routeConfig.label,
          { category, icon }
        );

        childRoutes
          .filter(({ isInSidebar }) => isInSidebar)
          .forEach(childRoute => {
            NavigationService.registerSecondary(
              primaryPath,
              childRoute.path,
              childRoute.component.routeConfig.label
            );
          });
      });
  }
};

export default NavigationServiceUtil;
