import { Route, Redirect } from "react-router";

import SettingsPage from "../pages/SettingsPage";

const settingsRoutes = [
  {
    type: Redirect,
    from: "/settings",
    to: "/settings/repositories"
  },
  {
    type: Route,
    path: "settings",
    component: SettingsPage,
    category: "system",
    isInSidebar: true,
    children: []
  }
];

module.exports = settingsRoutes;
