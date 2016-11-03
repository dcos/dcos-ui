import {Route, Redirect} from 'react-router';
import {Hooks} from 'PluginSDK';

import cluster from './cluster';
import components from './components';
import dashboard from './dashboard';
import Index from '../pages/Index';
import Network from './factories/network';
import nodes from '../../../plugins/nodes/src/js/routes/nodes';
import NotFoundPage from '../pages/NotFoundPage';
import Organization from './factories/organization';
import settings from './settings';
import styles from './styles';
import RoutingService from '../system/RoutingService';
import services from '../../../plugins/services/src/js/routes/services';
import jobs from './jobs';
import universe from './universe';

// Modules that produce routes
let routeFactories = [Organization, Network];

function getApplicationRoutes() {
  // Statically defined routes
  let routes = [].concat(
    {
      type: Redirect,
      path: '/',
      to: Hooks.applyFilter('applicationRedirectRoute', '/dashboard')
    },
    dashboard,
    services,
    jobs,
    nodes,
    universe,
    cluster,
    components,
    settings,
    styles
  );

  routeFactories.forEach(function (routeFactory) {
    routes = routes.concat(routeFactory.getRoutes());
  });

  routes = [
    {
      type: Route,
      children: [
        {
          type: Route,
          id: 'index',
          component: Index,
          children: routes
        }
      ]
    },
    {
      type: Route,
      path: '*',
      component: NotFoundPage
    }
  ];

  return routes;
}

function getRoutes() {
  // Get application routes
  let routes = getApplicationRoutes();

  // Provide opportunity for plugins to inject routes
  routes = Hooks.applyFilter('applicationRoutes', routes);

  let indexRoute = routes[0].children.find((route) => route.id === 'index');

  // Register packages
  RoutingService.render(indexRoute.children);

  return routes;
}

module.exports = {
  getRoutes
};
