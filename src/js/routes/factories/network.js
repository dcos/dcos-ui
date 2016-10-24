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
        handler: VirtualNetworksTab,
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
        handler: VirtualNetworkDetail,
        children: [
          {
            type: DefaultRoute,
            handler: VirtualNetworkTaskTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks',
                getCrumbs(router) {
                  let {overlayName} = router.getCurrentParams();

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
            handler: VirtualNetworkDetailsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks',
                getCrumbs(router) {
                  let {overlayName} = router.getCurrentParams();

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
        type: Route,
        path: 'virtual-networks/:overlayName/tasks/:taskID',
        handler: TaskDetail,
        hideHeaderNavigation: true,
        buildBreadCrumb() {
          return {
            parentCrumb: '/network/virtual-networks/:overlayName/tasks',
            getCrumbs(router) {
              return [{label: router.getCurrentParams().taskID}];
            }
          };
        },
        children: [
          {
            type: DefaultRoute,
            handler: TaskDetailsTab,
            hideHeaderNavigation: true,
            title:'Details',
            buildBreadCrumb() {
              return {
                parentCrumb: '/network/virtual-networks/:overlayName/tasks/:taskID',
                getCrumbs() { return []; }
              };
            }
          },
          {
            type: Route,
            path: 'files',
            title:'Files',
            children: [
              {
                type: DefaultRoute,
                hideHeaderNavigation: true,
                handler: TaskFilesTab,
                fileViewerRoutePath: '/network/virtual-networks/:overlayName/tasks/:taskID/view',
                buildBreadCrumb() {
                  return {
                    parentCrumb: '/network/virtual-networks/:overlayName/tasks/:taskID',
                    getCrumbs() { return []; }
                  };
                }
              },
              {
                type: Route,
                path: 'view/?:filePath?/?:innerPath?',
                hideHeaderNavigation: true,
                handler: TaskFileViewer,
                dontScroll: true,
                buildBreadCrumb() {
                  return {
                    parentCrumb: '/network/virtual-networks/:overlayName/tasks/:taskID',
                    getCrumbs() { return []; }
                  };
                }
              }
            ]
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
          to: '/network/virtual-networks'
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
      path: 'network',
      handler: NetworkPage,
      category: 'resources',
      isInSidebar: true,
      children
    };
  }
};

module.exports = RouteFactory;
