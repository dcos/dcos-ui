import { Route } from "react-router";

import GroupDetailPage from "./components/GroupDetailPage";
import GroupsPage from "./pages/GroupsPage";

const SDK = require("../../SDK");

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
    SDK.getSDK().Hooks.addFilter(
      "organizationRoutes",
      this.appendRoutes.bind(this)
    );
  }
};
