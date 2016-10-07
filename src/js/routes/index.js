import {Route, Redirect} from 'react-router';
import {Hooks} from 'PluginSDK';

import cluster from './cluster';
import components from './components';
import dashboard from './dashboard';
import Index from '../pages/Index';
import Network from './factories/network';
import nodes from './nodes';
import NotFoundPage from '../pages/NotFoundPage';
import Organization from './factories/organization';
import services from './services';
import settings from './settings';
import styles from './styles';
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
      path: '/',
      to: Hooks.applyFilter('applicationRedirectRoute', '/dashboard')
    },
    {
      type: Route,
      path: '*',
      component: NotFoundPage
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
          component: Index,
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
