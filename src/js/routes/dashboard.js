import Router from 'react-router';
let Route = Router.Route;

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
    },
    {
      type: Route,
      name: 'dashboard-units-unit-nodes-panel',
      path: 'system/components/:unitID/?',
      children: [
        {
          type: Route,
          name: 'dashboard-units-unit-nodes-node-panel',
          path: 'nodes/:unitNodeID/?'
        }
      ]
    }
  ]
};

module.exports = dashboardRoutes;
