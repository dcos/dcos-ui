import { decorate, injectable, inject } from "inversify";
import React from "react";
import { getRoutes } from "../routes";

export default class LegacyNavigation {
  constructor(routingService) {
    this._routingService = routingService;
  }

  getElements() {
    const routes = getRoutes(this._routingService);
    const indexRoute = routes[0].childRoutes.find(
      route => route.id === "index"
    );

    if (!indexRoute) {
      return [];
    }

    const elements = [];
    const categories = {};

    indexRoute.childRoutes
      .filter(({ isInSidebar }) => isInSidebar)
      .forEach(function(route) {
        const { path, category, childRoutes = [] } = route;
        const primaryPath = `/${path}`;

        if (!(category in categories)) {
          elements.push({ path: category, name: category, children: [] });
          categories[category] = true;
        }

        const icon = React.cloneElement(route.component.routeConfig.icon, {
          className: "sidebar-menu-item-icon icon icon-small"
        });

        elements.push({
          parent: category,
          path: primaryPath,
          link: route.component.routeConfig.label,
          icon
        });

        childRoutes
          .filter(({ isInSidebar }) => isInSidebar)
          .forEach(childRoute => {
            elements.push({
              parent: primaryPath,
              path: `${primaryPath}/${childRoute.path}`,
              link: childRoute.component.routeConfig.label,
              isActiveRegex: childRoute.sidebarActiveRegex
            });
          });
      });

    return elements;
  }
}

decorate(injectable(), LegacyNavigation);
decorate(inject("RoutingService"), LegacyNavigation, 0);
