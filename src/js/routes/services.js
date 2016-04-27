import Router from 'react-router';
let Route = Router.Route;

import ServiceOverlay from '../components/ServiceOverlay';
import ServicesPage from '../pages/ServicesPage';
import ServicesTab from '../pages/services/ServicesTab';

let servicesRoutes = {
  type: Route,
  name: 'services',
  path: 'services/?',
  handler: ServicesPage,
  children: [
    // Undocumented RR 0.13.5 behaviour: unnamed routes are treated as default
    {
      type: Route,
      handler: ServicesTab
    },
    {
      type: Route,
      name: 'services-detail',
      path: ':id/?'
    },
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
