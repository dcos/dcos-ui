import {Route, Redirect} from 'react-router';
import {Hooks} from 'PluginSDK';

import cluster from './cluster';
import components from './components';
import dashboard from './dashboard';
import Index from '../pages/Index';
import jobs from './jobs';
import Network from './factories/network';
import nodes from '../../../plugins/nodes/src/js/routes/nodes';
import NotFoundPage from '../pages/NotFoundPage';
import Organization from './factories/organization';
import {RoutingService} from '../../../foundation-ui/routing';
import services from '../../../plugins/services/src/js/routes/services';
import settings from './settings';
import styles from './styles'; // eslint-disable-line
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
    settings
    // Plugins routes will be appended to this array
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
          children: routes,
          component: Index
        },
        {
          // This is a bit tricky
          // NotFoundPage should not be among children of id: index
          // yet it expects Index to be its parent
          type: Route,
          component: Index,
          children: [
            // Please make sure this is THE LAST route and is not inside of id: 'index'
            // as this is a glob route and matching stops here
            // making all the routes going after this point unreachable (plugins)
            {
              type: Route,
              path: '*',
              component: NotFoundPage
            }
          ]
        }
      ]
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
  indexRoute.children = indexRoute.children.concat(
    RoutingService.getDefinition()
  );

  return routes;
}

module.exports = {
  getRoutes
};
