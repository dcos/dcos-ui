import { Route, Redirect } from "react-router";

import RepositoriesList from "#PLUGINS/catalog/src/js/repositories/RepositoriesList";
import SettingsPage from "#SRC/js/pages/SettingsPage";
import UISettingsPage from "#SRC/js/pages/settings/UISettingsPage";

const settingsRoutes = [
  {
    type: Redirect,
    from: "/settings",
    to: "/settings/ui-settings"
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
        path: "ui-settings",
        component: UISettingsPage,
        isInSidebar: true
      },
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
