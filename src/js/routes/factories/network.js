/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {Route, Redirect} from 'react-router';

import {Hooks} from 'PluginSDK';
import NetworkPage from '../../pages/NetworkPage';
import VirtualNetworksTab from '../../pages/network/VirtualNetworksTab';

let RouteFactory = {
  getNetworkRoutes() {
    let virtualNetworksRoute = [
      {
        type: Route,
        name: 'virtual-networks-tab',
        path: 'virtual-networks/?',
        handler: VirtualNetworksTab,
        buildBreadCrumb: function () {
          return {
            getCrumbs: function () {
              return [{
                label: 'Virtual Networks',
                route: {to: 'virtual-networks-tab'}
              }];
            }
          }
        }
      }
    ];

    // Return filtered Routes
    return this.getFilteredRoutes(
      // Pass in Object so Plugins can mutate routes and the default redirect
      Hooks.applyFilter('networkRoutes', {
        routes: virtualNetworksRoute,
        redirect: {
          type: Redirect,
          from: '/network/?',
          to: 'virtual-networks-tab'
        }
      })
    );
  },

  getFilteredRoutes(filteredRoutes) {
    // Push redirect onto Routes Array
    return filteredRoutes.routes.concat([filteredRoutes.redirect]);
  },

  getRoutes() {
    let children = this.getNetworkRoutes();

    return {
      type: Route,
      name: 'network',
      path: 'network/?',
      handler: NetworkPage,
      children
    };
  }
};

module.exports = RouteFactory;
