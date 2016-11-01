import {Route} from 'react-router';

import DashboardPage from '../pages/DashboardPage';

let dashboardRoutes = {
  category: 'root',
  type: Route,
  path: 'dashboard',
  component: DashboardPage,
  isInSidebar: true
};

module.exports = dashboardRoutes;
