import { Route } from "react-router";
import { MountService } from "foundation-ui";

import ClusterLinkingModal from "./components/ClusterLinkingModal";
import ClusterLinkingModalTrigger from "./components/ClusterLinkingModalTrigger";
import LinkedClustersPage from "./pages/LinkedClustersPage";
import { Hooks } from "PluginSDK";

import "./styles/cluster-linking-modal.less";

module.exports = {
  filters: ["applicationRoutes"],

  initialize() {
    MountService.MountService.registerComponent(
      ClusterLinkingModal,
      "Modals:SwitchingModal"
    );

    MountService.MountService.registerComponent(
      ClusterLinkingModalTrigger,
      "SidebarHeader:SwitchingModalTrigger"
    );

    this.filters.forEach((filter) => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  applicationRoutes(routes) {
    // Find the route we wish to modify, the index route.
    const indexRoute = routes[0].children.find((route) => route.id === "index");

    const clusterRoute = indexRoute.children.find(
      (route) => route.id === "cluster"
    );

    if (!clusterRoute || !clusterRoute.children) {
      return routes;
    }

    // Append the security routes to the index route's children.
    clusterRoute.children.push({
      type: Route,
      path: "linked",
      component: LinkedClustersPage,
      isInSidebar: true,
    });

    return routes;
  },
};
