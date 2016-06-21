import {Route, Redirect, NotFoundRoute} from 'react-router';

import dashboard from './dashboard';
import {Hooks} from 'PluginSDK';
import Index from '../pages/Index';
import Network from './factories/network';
import nodes from './nodes';
import NotFoundPage from '../pages/NotFoundPage';
import System from './factories/system';
import services from './services';
import jobs from './jobs';
import universe from './universe';

// Modules that produce routes
let routeFactories = [System, Network];

function getApplicationRoutes() {
  // Statically defined routes
  let routes = [
    dashboard,
    services,
    jobs,
    nodes,
    universe,
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
