import { Route, Redirect } from "react-router";

import RepositoriesTab from "../pages/system/RepositoriesTab";
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
    children: [
      {
        type: Route,
        path: "repositories",
        component: RepositoriesTab,
        isInSidebar: true
      }
    ]
  }
];

module.exports = settingsRoutes;
