import { Route, IndexRoute } from "react-router";
import { i18nMark } from "@lingui/react";

import ComponentsPage from "../pages/ComponentsPage";
import UnitsHealthDetail from "../pages/system/UnitsHealthDetail";
import ComponentsUnitsHealthNodeDetailPage from "../pages/system/ComponentsUnitsHealthNodeDetailPage";
import UnitsHealthTab from "../pages/system/UnitsHealthTab";

export default {
  type: Route,
  path: "components",
  component: ComponentsPage,
  category: i18nMark("system"),
  isInSidebar: true,
  children: [
    {
      type: IndexRoute,
      component: UnitsHealthTab
    },
    {
      type: Route,
      path: ":unitID",
      component: UnitsHealthDetail
    },
    {
      type: Route,
      path: ":unitID/nodes/:unitNodeID",
      component: ComponentsUnitsHealthNodeDetailPage
    }
  ]
};
