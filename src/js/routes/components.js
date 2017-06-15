/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Route, IndexRoute } from "react-router";

import ComponentsPage from "../pages/ComponentsPage";
import UnitsHealthDetail from "../pages/system/UnitsHealthDetail";
import ComponentsUnitsHealthNodeDetailPage
  from "../pages/system/ComponentsUnitsHealthNodeDetailPage";
import UnitsHealthDetailBreadcrumb
  from "../pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb";
import UnitsHealthNodeDetailBreadcrumb
  from "../pages/system/breadcrumbs/UnitsHealthNodeDetailBreadcrumb";
import UnitsHealthTab from "../pages/system/UnitsHealthTab";

const componentsRoutes = {
  type: Route,
  path: "components",
  component: ComponentsPage,
  category: "system",
  isInSidebar: true,
  buildBreadCrumb() {
    return {
      getCrumbs() {
        return [
          {
            label: "System Components",
            route: { to: "/components" }
          }
        ];
      }
    };
  },
  children: [
    {
      type: IndexRoute,
      component: UnitsHealthTab
    },
    {
      type: Route,
      path: ":unitID",
      component: UnitsHealthDetail,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: "/components",
          getCrumbs(params, routes) {
            return [
              <UnitsHealthDetailBreadcrumb
                params={params}
                routes={routes}
                to="/components/:unitID"
                routePath=":unitID"
              />
            ];
          }
        };
      }
    },
    {
      type: Route,
      path: ":unitID/nodes/:unitNodeID",
      component: ComponentsUnitsHealthNodeDetailPage,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: "/components/:unitID",
          getCrumbs(params, routes) {
            return [
              <UnitsHealthNodeDetailBreadcrumb
                params={params}
                routes={routes}
                to="/components/:unitID/nodes/:unitNodeID"
                routePath=":unitID/nodes/:unitNodeID"
              />
            ];
          }
        };
      }
    }
  ]
};

module.exports = componentsRoutes;
