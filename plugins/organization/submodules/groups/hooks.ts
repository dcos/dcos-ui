import { Route } from "react-router";

import GroupDetailPage from "./components/GroupDetailPage";
import GroupsPage from "./pages/GroupsPage";

import { Hooks } from "PluginSDK";

module.exports = {
  appendRoutes(route) {
    route.routes.push(
      {
        type: Route,
        path: "groups",
        component: GroupsPage,
        isInSidebar: true
      },
      {
        type: Route,
        path: "groups/:groupID",
        component: GroupDetailPage
      }
    );

    return route;
  },

  initialize() {
    Hooks.addFilter("organizationRoutes", this.appendRoutes.bind(this));
  }
};
