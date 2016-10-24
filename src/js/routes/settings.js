import {Route, Redirect} from 'react-router';

import RepositoriesTab from '../pages/system/RepositoriesTab';
import SettingsPage from '../pages/SettingsPage';

let settingsRoutes = {
  type: Route,
  path: 'settings',
  handler: SettingsPage,
  category: 'system',
  isInSidebar: true,
  children: [
    {
      type: Route,
      path: 'repositories',
      handler: RepositoriesTab,
      isInSidebar: true
    },
    {
      type: Redirect,
      from: '/settings',
      to: '/settings/repositories'
    }
  ]
};

module.exports = settingsRoutes;
