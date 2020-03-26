import { Route } from "react-router";
import { MountService } from "foundation-ui";

import ServiceAccountsPage from "./pages/ServiceAccountsPage";
import ServiceAccoutSelect from "./components/ServiceAccountSelect";
import { Hooks } from "PluginSDK";

module.exports = {
  filters: ["organizationRoutes"],

  actions: ["userCapabilitiesFetched"],

  initialize() {
    this.filters.forEach((filter) => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });

    this.actions.forEach((action) => {
      Hooks.addAction(action, this[action].bind(this));
    });
  },

  userCapabilitiesFetched() {
    MountService.MountService.registerComponent(
      ServiceAccoutSelect,
      "SchemaField:application/x-service-account+string"
    );
  },

  organizationRoutes(route) {
    route.routes.push({
      type: Route,
      path: "service-accounts",
      component: ServiceAccountsPage,
      isInSidebar: true,
      children: [
        {
          type: Route,
          path: ":serviceAccountID",
        },
      ],
    });

    return route;
  },
};
