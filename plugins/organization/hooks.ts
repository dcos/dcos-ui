import { Redirect, Route } from "react-router";
import UsersPage from "#SRC/js/pages/system/UsersPage";

const SDK = require("./SDK");

const defaultOrganizationRoute = {
  routes: []
};

module.exports = {
  actions: [],

  filters: ["organizationRoutes"],

  initialize() {
    this.filters.forEach(filter => {
      SDK.getSDK().Hooks.addFilter(filter, this[filter].bind(this));
    });
    this.actions.forEach(action => {
      SDK.getSDK().Hooks.addAction(action, this[action].bind(this));
    });
  },

  // Ensure user route under organization
  organizationRoutes(routeDefinition = defaultOrganizationRoute) {
    const userRoute = {
      type: Route,
      path: "users",
      component: UsersPage,
      isInSidebar: true
    };
    const usersRouteIndex = routeDefinition.routes.findIndex(
      route => route.path === userRoute.path
    );
    // Replace by new definition
    if (usersRouteIndex !== -1) {
      routeDefinition.routes.splice(usersRouteIndex, 1, userRoute);
    }

    // Add user route if not already present
    if (usersRouteIndex === -1) {
      routeDefinition.routes.push(userRoute);
    }

    routeDefinition.redirect = {
      type: Redirect,
      from: "/organization",
      to: "/organization/users"
    };

    return routeDefinition;
  }
};
