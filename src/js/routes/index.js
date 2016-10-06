import {Route, Redirect, NotFoundRoute} from 'react-router';
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
import services from '../../../plugins/services/src/js/routes/services';
import jobs from './jobs';
import universe from './universe';

// Modules that produce routes
let routeFactories = [Organization, Network];

function getApplicationRoutes() {
  // Statically defined routes
  let routes = [
    dashboard,
    services,
    jobs,
    nodes,
    universe,
    cluster,
    components,
    settings,
    styles,
    {
      type: Redirect,
      from: '/',
      to: Hooks.applyFilter('applicationRedirectRoute', 'dashboard')
    },
    {
      type: NotFoundRoute,
      handler: NotFoundPage
    }
  ];

  routeFactories.forEach(function (routeFactory) {
    routes.push(routeFactory.getRoutes());
  });

  return [
    {
      type: Route,
      name: 'home',
      path: '/',
      children: [
        {
          type: Route,
          id: 'index',
          handler: Index,
          children: routes
        }
      ]
    }
  ];
}

function getRoutes() {
  // Get application routes
  let routes = getApplicationRoutes();
  // Provide opportunity for plugins to inject routes
  return Hooks.applyFilter('applicationRoutes', routes);
}

module.exports = {
  getRoutes
};
