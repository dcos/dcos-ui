import { IndexRoute, Redirect, Route } from "react-router";

import BackendDetailPage from "./submodules/internal-load-balancing/components/BackendDetailPage";
import LoadBalancingPage from "./submodules/internal-load-balancing/components/LoadBalancingPage";
import LoadBalancingTabContent from "./submodules/internal-load-balancing/components/LoadBalancingTabContent";
import VIPDetailPage from "./submodules/internal-load-balancing/components/VIPDetailPage";
import { Hooks } from "PluginSDK";

module.exports = {
  filters: ["networkRoutes", "service-addresses-subtabs"],

  initialize() {
    this.filters.forEach((filter) => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  "service-addresses-subtabs": (tabs) => tabs,

  networkRoutes(routeConfig) {
    // Add loadbalancing tab
    routeConfig.routes.push({
      type: Route,
      path: "service-addresses",
      component: LoadBalancingPage,
      isInSidebar: true,
      children: [
        {
          type: IndexRoute,
          component: LoadBalancingTabContent,
        },
        {
          type: Route,
          path: "internal/service-address-detail/:vip/:protocol/:port",
          component: VIPDetailPage,
        },
        {
          type: Route,
          path:
            "internal/service-address-detail/:vip/:protocol/:port/backend-detail/:backend_vip/:backend_protocol(/:backend_port)",
          component: BackendDetailPage,
        },
      ],
    });

    // Override redirect
    routeConfig.redirect = {
      type: Redirect,
      from: "/networking",
      to: "/networking/networks",
    };

    return routeConfig;
  },
};
