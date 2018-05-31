/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Route, IndexRoute } from "react-router";

import ComponentsPage from "../pages/ComponentsPage";
import UnitsHealthDetail from "../pages/system/UnitsHealthDetail";
import ComponentsUnitsHealthNodeDetailPage from "../pages/system/ComponentsUnitsHealthNodeDetailPage";
import UnitsHealthTab from "../pages/system/UnitsHealthTab";

const componentsRoutes = {
  type: Route,
  path: "components",
  component: ComponentsPage,
  category: "system",
  isInSidebar: true,
  children: [
    {
      type: IndexRoute,
      component: UnitsHealthTab
    },
    {
      type: Route,
      path: ":unitID",
      component: UnitsHealthDetail,
      hideHeaderNavigation: true
    },
    {
      type: Route,
      path: ":unitID/nodes/:unitNodeID",
      component: ComponentsUnitsHealthNodeDetailPage,
      hideHeaderNavigation: true
    }
  ]
};

module.exports = componentsRoutes;
