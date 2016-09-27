import {Route} from 'react-router';

import DashboardPage from '../pages/DashboardPage';

let dashboardRoutes = {
  category: 'root',
  type: Route,
  name: 'dashboard',
  path: 'dashboard/?',
  handler: DashboardPage,
  isInSidebar: true
};

module.exports = dashboardRoutes;
