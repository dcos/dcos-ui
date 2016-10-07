/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {IndexRoute, Route, Redirect} from 'react-router';

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
        path: 'virtual-networks',
        component: VirtualNetworksTab,
        buildBreadCrumb() {
          return {
            getCrumbs() {
              return [{
                label: 'Virtual Networks',
                route: {to: 'virtual-networks-tab'}
              }];
            }
          };
        }
      },
      {
        type: Route,
        name: 'virtual-networks-tab-detail',
        path: 'virtual-networks/:overlayName',
        component: VirtualNetworkDetail,
        children: [
          {
            type: IndexRoute,
            name: 'virtual-networks-tab-detail-tasks',
            component: VirtualNetworkTaskTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: 'virtual-networks-tab',
                getCrumbs(router) {
                  let {overlayName} = router.getCurrentParams();

                  return [{
                    label: overlayName,
                    route: {
                      to: 'virtual-networks-tab-detail-tasks',
                      params: {overlayName}
                    }
                  }];
                }
              };
            }
          },
          {
            type: Route,
            name: 'virtual-networks-tab-detail-details',
            path: 'details',
            component: VirtualNetworkDetailsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: 'virtual-networks-tab',
                getCrumbs(router) {
                  let {overlayName} = router.getCurrentParams();

                  return [{
                    label: overlayName,
                    route: {
                      to: 'virtual-networks-tab-detail-details',
                      params: {overlayName}
                    }
                  }];
                }
              };
            }
          }
        ]
      },
      {
        type: Route,
        name: 'virtual-networks-tab-detail-tasks-detail',
        path: 'virtual-networks/:overlayName/tasks/:taskID',
        component: TaskDetail,
        hideHeaderNavigation: true,
        buildBreadCrumb() {
          return {
            parentCrumb: 'virtual-networks-tab-detail-tasks',
            getCrumbs(router) {
              return [{label: router.getCurrentParams().taskID}];
            }
          };
        },
        children: [
          {
            type: IndexRoute,
            name: 'virtual-networks-tab-detail-tasks-details-tab',
            component: TaskDetailsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                getCrumbs() { return []; }
              };
            },
            title: 'Details'
          },
          {
            type: Route,
            name: 'virtual-networks-tab-detail-tasks-details-files',
            path: 'files',
            component: TaskFilesTab,
            hideHeaderNavigation: true,
            logRouteName: 'virtual-networks-tab-detail-tasks-details-logs',
            buildBreadCrumb() {
              return {
                parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                getCrumbs() { return []; }
              };
            },
            title: 'Files'
          },
          {
            type: Route,
            name: 'virtual-networks-tab-detail-tasks-details-logs',
            dontScroll: true,
            path: 'logs/:filePath?/?:innerPath?',
            component: TaskLogsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                getCrumbs() { return []; }
              };
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
          from: '/network',
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
      path: 'network',
      component: NetworkPage,
      category: 'resources',
      isInSidebar: true,
      children
    };
  }
};

module.exports = RouteFactory;
