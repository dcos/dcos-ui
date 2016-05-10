import {Route} from 'react-router';

import DashboardPage from '../pages/DashboardPage';

let dashboardRoutes = {
  type: Route,
  name: 'dashboard',
  path: 'dashboard/?',
  handler: DashboardPage,
  children: [
    {
      type: Route,
      name: 'dashboard-panel',
      path: 'service-detail/:serviceName/?'
    },
    {
      type: Route,
      name: 'dashboard-task-panel',
      path: 'task-detail/:taskID/?'
    }
  ]
};

module.exports = dashboardRoutes;
