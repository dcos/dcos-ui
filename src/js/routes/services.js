import Router from 'react-router';
let Route = Router.Route;

import ServiceOverlay from '../components/ServiceOverlay';
import ServicesPage from '../pages/ServicesPage';

let servicesRoutes = {
  type: Route,
  name: 'services',
  path: 'services/?',
  handler: ServicesPage,
  children: [
    {
      type: Route,
      name: 'service-ui',
      path: 'ui/:serviceName/?',
      handler: ServiceOverlay
    },
    {
      type: Route,
      name: 'services-panel',
      path: 'service-detail/:serviceName/?'
    },
    {
      type: Route,
      name: 'services-task-panel',
      path: 'task-detail/:taskID/?'
    }
  ]
};

module.exports = servicesRoutes;
