import { Route, Redirect } from "react-router";

import SystemOverviewPage from "../pages/SystemOverviewPage";
import OverviewDetailTab from "../pages/system/OverviewDetailTab";

const systemOverviewRoutes = [
  {
    type: Redirect,
    from: "/cluster",
    to: "/cluster/overview"
  },
  {
    type: Route,
    id: "cluster",
    path: "cluster",
    component: SystemOverviewPage,
    category: "system",
    isInSidebar: true,
    children: [
      {
        type: Route,
        path: "overview",
        component: OverviewDetailTab,
        isInSidebar: true
      }
    ]
  }
];

module.exports = systemOverviewRoutes;
