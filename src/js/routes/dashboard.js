import { Route } from "react-router";

import DashboardPage from "../pages/DashboardPage";

export default {
  category: "root",
  type: Route,
  path: "dashboard",
  component: DashboardPage,
  isInSidebar: true
};
