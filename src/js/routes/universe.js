import { Route, Redirect } from "react-router";

import InstalledPackagesTab from "../pages/universe/InstalledPackagesTab";
import PackageDetailTab from "../pages/universe/PackageDetailTab";
import PackagesTab from "../pages/universe/PackagesTab";
import UniversePage from "../pages/UniversePage";

const universeRoutes = [
  {
    type: Redirect,
    from: "/universe",
    to: "/universe/packages"
  },
  {
    type: Route,
    path: "universe",
    component: UniversePage,
    category: "root",
    isInSidebar: true,
    children: [
      {
        type: Route,
        path: "packages",
        component: PackagesTab,
        isInSidebar: true
      },
      {
        type: Route,
        path: "packages/:packageName",
        component: PackageDetailTab,
        hideHeaderNavigation: true
      },
      {
        type: Route,
        path: "installed-packages",
        component: InstalledPackagesTab,
        isInSidebar: true
      }
    ]
  }
];

module.exports = universeRoutes;
