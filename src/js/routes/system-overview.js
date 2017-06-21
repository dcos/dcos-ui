import { Route, IndexRoute } from "react-router";

import SystemOverviewPage from "../pages/SystemOverviewPage";
import OverviewDetailTab from "../pages/system/OverviewDetailTab";

const systemOverviewRoutes = {
  type: Route,
  path: "system-overview",
  component: SystemOverviewPage,
  category: "system",
  isInSidebar: true,
  children: [
    {
      type: IndexRoute,
      component: OverviewDetailTab
    }
  ]
};

module.exports = systemOverviewRoutes;
