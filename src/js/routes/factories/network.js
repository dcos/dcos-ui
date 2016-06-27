/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {DefaultRoute, Route, Redirect} from 'react-router';

import {Hooks} from 'PluginSDK';
import NetworkPage from '../../pages/NetworkPage';
import VirtualNetworksTab from '../../pages/network/VirtualNetworksTab';
import VirtualNetworkDetail from '../../pages/network/virtual-network-detail/VirtualNetworkDetail';
import VirtualNetworkTaskTab from '../../pages/network/virtual-network-detail/VirtualNetworkTaskTab';
import VirtualNetworkDetailsTab from '../../pages/network/virtual-network-detail/VirtualNetworkDetailsTab';
import TaskDetail from '../../pages/task-details/TaskDetail';
import TaskDetailsTab from '../../pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../../pages/task-details/TaskFilesTab';
import TaskLogsTab from '../../pages/task-details/TaskLogsTab';

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
      },
      {
        type: Route,
        name: 'virtual-networks-tab-detail',
        path: 'virtual-networks/:overlayName/?',
        handler: VirtualNetworkDetail,
        children: [
          {
            type: DefaultRoute,
            name: 'virtual-networks-tab-detail-tasks',
            handler: VirtualNetworkTaskTab,
            hideHeaderNavigation: true,
            buildBreadCrumb: function () {
              return {
                parentCrumb: 'virtual-networks-tab',
                getCrumbs: function (router) {
                  let {overlayName} = router.getCurrentParams();

                  return [{
                    label: overlayName,
                    route: {
                      to: 'virtual-networks-tab-detail-tasks',
                      params: {overlayName}
                    }
                  }];
                }
              }
            }
          },
          {
            type: Route,
            name: 'virtual-networks-tab-detail-details',
            path: 'details/?',
            handler: VirtualNetworkDetailsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb: function () {
              return {
                parentCrumb: 'virtual-networks-tab',
                getCrumbs: function (router) {
                  let {overlayName} = router.getCurrentParams();

                  return [{
                    label: overlayName,
                    route: {
                      to: 'virtual-networks-tab-detail-details',
                      params: {overlayName}
                    }
                  }];
                }
              }
            }
          }
        ]
      },
      {
        type: Route,
        name: 'virtual-networks-tab-detail-tasks-detail',
        path: 'virtual-networks/:overlayName/tasks/:taskID/?',
        handler: TaskDetail,
        hideHeaderNavigation: true,
        buildBreadCrumb: function () {
          return {
            parentCrumb: 'virtual-networks-tab-detail-tasks',
            getCrumbs: function (router) {
              return [{label: router.getCurrentParams().taskID}];
            }
          }
        },
        children: [
          {
            type: DefaultRoute,
            name: 'virtual-networks-tab-detail-tasks-details-tab',
            handler: TaskDetailsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb: function () {
              return {
                parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                getCrumbs: function () { return []; }
              }
            },
            title: 'Details'
          },
          {
            type: Route,
            name: 'virtual-networks-tab-detail-tasks-details-files',
            path: 'files/?',
            handler: TaskFilesTab,
            hideHeaderNavigation: true,
            logRouteName: 'virtual-networks-tab-detail-tasks-details-logs',
            buildBreadCrumb: function () {
              return {
                parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                getCrumbs: function () { return []; }
              }
            },
            title: 'Files'
          },
          {
            type: Route,
            name: 'virtual-networks-tab-detail-tasks-details-logs',
            dontScroll: true,
            path: 'logs/:filePath?/?:innerPath?/?',
            handler: TaskLogsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb: function () {
              return {
                parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                getCrumbs: function () { return []; }
              }
            },
            title: 'Logs'
          }
        ]
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
