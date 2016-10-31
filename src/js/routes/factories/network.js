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

import TaskDetail from '../../../../plugins/services/src/js/pages/task-details/TaskDetail';
import TaskDetailsTab from '../../../../plugins/services/src/js/pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../../../../plugins/services/src/js/pages/task-details/TaskFilesTab';
import TaskFileViewer from '../../../../plugins/services/src/js/pages/task-details/TaskFileViewer';

let RouteFactory = {
  getNetworkRoutes() {
    let virtualNetworksRoute = [
      {
        type: Route,
        path: 'virtual-networks',
        component: VirtualNetworksTab,
        isInSidebar: true,
        buildBreadCrumb() {
          return {
            getCrumbs() {
              return [{
                label: 'Virtual Networks',
                route: {to: '/network/virtual-networks'}
              }];
            }
          };
        }
      },
      {
        type: Route,
        path: 'virtual-networks/:overlayName',
        component: VirtualNetworkDetail,
        children: [
          {
            type: IndexRoute,
            component: VirtualNetworkTaskTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks',
                getCrumbs(params) {
                  let {overlayName} = params;

                  return [{
                    label: overlayName,
                    route: {
                      to: '/network/virtual-networks/:overlayName',
                      params: {overlayName}
                    }
                  }];
                }
              };
            }
          },
          {
            type: Route,
            path: 'details',
            component: VirtualNetworkDetailsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks',
                getCrumbs(params) {
                  let {overlayName} = params;

                  return [{
                    label: overlayName,
                    route: {
                      to: '/network/virtual-networks/:overlayName',
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
        type: Redirect,
        path: '/network/virtual-networks/:overlayName/tasks/:taskID',
        to: '/network/virtual-networks/:overlayName/tasks/:taskID/details'
      },
      {
        type: Route,
        path: 'virtual-networks/:overlayName/tasks/:taskID',
        component: TaskDetail,
        hideHeaderNavigation: true,
        buildBreadCrumb() {
          return {
            parentCrumb: '/network/virtual-networks/:overlayName/tasks',
            getCrumbs(params) {
              return [{label: params.taskID}];
            }
          };
        },
        children: [
          {
            component: TaskDetailsTab,
            hideHeaderNavigation: true,
            isTab: true,
            path: 'details',
            title: 'Details',
            type: Route,
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks/:overlayName/tasks/:taskID',
                getCrumbs() { return []; }
              };
            }
          },
          {
            component: TaskFilesTab,
            fileViewerRoutePath: '/network/virtual-networks/:overlayName/tasks/:taskID/view(/:filePath(/:innerPath))',
            hideHeaderNavigation: true,
            isTab: true,
            path: 'files',
            title: 'Files',
            type: Route,
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks/:overlayName/tasks/:taskID',
                getCrumbs() { return []; }
              };
            }
          },
          {
            component: TaskFileViewer,
            hideHeaderNavigation: true,
            dontScroll: true,
            isTab: true,
            path: 'view(/:filePath(/:innerPath))',
            title: 'Logs',
            type: Route,
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks/:overlayName/tasks/:taskID',
                getCrumbs() { return []; }
              };
            }
          }
        ]
      }
    ];

    // Return filtered Routes
    // Pass in Object so Plugins can mutate routes and the default redirect
    return Hooks.applyFilter('networkRoutes', {
      routes: virtualNetworksRoute,
      redirect: {
        type: Redirect,
        from: '/network',
        to: '/network/virtual-networks'
      }
    });
  },

  getRoutes() {
    let {routes, redirect} = this.getNetworkRoutes();

    return [
      // Redirect should always go before path, otherwise router won't ever reach it
      redirect,
      {
        type: Route,
        path: 'network',
        component: NetworkPage,
        category: 'resources',
        isInSidebar: true,
        children: routes
      }
    ];
  }
};

module.exports = RouteFactory;
