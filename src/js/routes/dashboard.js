import {Route} from 'react-router';

import DashboardPage from '../pages/DashboardPage';
import SidebarActions from '../events/SidebarActions';

let dashboardRoutes = {
  category: 'root',
  type: Route,
  name: 'dashboard',
  path: 'dashboard',
  component: DashboardPage,
  isInSidebar: true,
  onEnter: () => SidebarActions.close()
};

module.exports = dashboardRoutes;
