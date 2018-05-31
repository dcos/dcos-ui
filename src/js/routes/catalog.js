import { Route, Redirect } from "react-router";

import DeployFrameworkConfiguration from "#SRC/js/pages/catalog/DeployFrameworkConfiguration";
import PackageDetailTab from "../pages/catalog/PackageDetailTab";
import PackagesTab from "../pages/catalog/PackagesTab";
import CatalogPage from "../pages/CatalogPage";

const universeRoutes = [
  {
    // Keep this around for any old links pointing to /universe
    type: Redirect,
    from: "/universe",
    to: "/catalog"
  },
  {
    type: Redirect,
    from: "/catalog",
    to: "/catalog/packages"
  },
  {
    type: Route,
    path: "catalog",
    component: CatalogPage,
    category: "root",
    isInSidebar: true,
    children: [
      {
        type: Route,
        path: "packages",
        component: PackagesTab,
        hideHeaderNavigation: true
      },
      {
        type: Route,
        path: "packages/:packageName",
        component: PackageDetailTab,
        hideHeaderNavigation: true
      },
      {
        type: Route,
        path: "packages/:packageName/deploy",
        component: DeployFrameworkConfiguration
      }
    ]
  }
];

module.exports = universeRoutes;
