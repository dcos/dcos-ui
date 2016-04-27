import {Route, Redirect} from 'react-router';

import DeploymentsTab from '../pages/services/DeploymentsTab';
import ServiceOverlay from '../components/ServiceOverlay';
import ServicesPage from '../pages/ServicesPage';
import ServicesTab from '../pages/services/ServicesTab';

let serviceRoutes = {
  type: Route,
  name: 'services',
  handler: ServicesPage,
  path: '/services/?',
  children: [
    {
      type: Route,
      name: 'services-all',
      path: 'all/',
      handler: ServicesTab,
      children: [
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
    },
    {
      type: Route,
      name: 'services-deployments',
      path: 'deployments/',
      handler: DeploymentsTab
    },
    {
      type: Redirect,
      from: '/services/?',
      to: 'services-all'
    }
  ]
};

module.exports = serviceRoutes;
