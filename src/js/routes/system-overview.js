import { Route, Redirect } from "react-router";
import { i18nMark } from "@lingui/react";

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
    category: i18nMark("system"),
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

export default systemOverviewRoutes;
