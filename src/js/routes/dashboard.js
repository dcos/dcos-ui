import {Route} from 'react-router';

import DashboardPage from '../pages/DashboardPage';

let dashboardRoutes = {
  type: Route,
  name: 'dashboard',
  path: 'dashboard/?',
  handler: DashboardPage
};

module.exports = dashboardRoutes;
