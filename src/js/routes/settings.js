import { Route, Redirect } from "react-router";

import RepositoriesList
  from "#PLUGINS/catalog/src/js/repositories/RepositoriesList";
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
        component: RepositoriesList,
        isInSidebar: true
      }
    ]
  }
];

module.exports = settingsRoutes;
