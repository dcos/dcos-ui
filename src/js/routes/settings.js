import {Route, Redirect} from 'react-router';

import RepositoriesTab from '../pages/system/RepositoriesTab';
import SettingsPage from '../pages/SettingsPage';

let settingsRoutes = {
  type: Route,
  id: 'settings',
  name: 'settings',
  path: 'settings/?',
  handler: SettingsPage,
  category: 'system',
  isInSidebar: true,
  children: [
    {
      type: Route,
      id: 'settings-repositories',
      name: 'settings-repositories',
      path: 'repositories/?',
      handler: RepositoriesTab,
      isInSidebar: true
    },
    {
      type: Redirect,
      from: '/settings/?',
      to: 'settings-repositories'
    }
  ]
};

module.exports = settingsRoutes;
