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
import TaskFileViewer from '../../pages/task-details/TaskFileViewer';

let RouteFactory = {
  getNetworkRoutes() {
    let virtualNetworksRoute = [
      {
        type: Route,
        name: 'virtual-networks-tab',
        path: 'virtual-networks/?',
        handler: VirtualNetworksTab,
        isInSidebar: true,
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
        path: 'virtual-networks/:overlayName/?',
        handler: VirtualNetworkDetail,
        children: [
          {
            type: DefaultRoute,
            name: 'virtual-networks-tab-detail-tasks',
            handler: VirtualNetworkTaskTab,
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
            path: 'details/?',
            handler: VirtualNetworkDetailsTab,
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
        path: 'virtual-networks/:overlayName/tasks/:taskID/?',
        name: 'virtual-networks-tab-detail-tasks-detail',
        handler: TaskDetail,
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
            type: DefaultRoute,
            name: 'virtual-networks-tab-detail-tasks-details-tab',
            handler: TaskDetailsTab,
            hideHeaderNavigation: true,
            title:'Details',
            buildBreadCrumb() {
              return {
                parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                getCrumbs() { return []; }
              };
            }
          },
          {
            type: Route,
            name: 'virtual-networks-tab-detail-tasks-details-files',
            path: 'files/?',
            title:'Files',
            children: [
              {
                type: DefaultRoute,
                name: 'virtual-networks-tab-detail-tasks-details-files-directory',
                hideHeaderNavigation: true,
                handler: TaskFilesTab,
                fileViewerRouteName: 'virtual-networks-tab-detail-tasks-details-file-viewer',
                buildBreadCrumb() {
                  return {
                    parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                    getCrumbs() { return []; }
                  };
                }
              },
              {
                type: Route,
                path: 'view/:filePath?/?:innerPath?/?',
                hideHeaderNavigation: true,
                name: 'virtual-networks-tab-detail-tasks-details-file-viewer',
                handler: TaskFileViewer,
                dontScroll: true,
                buildBreadCrumb() {
                  return {
                    parentCrumb: 'virtual-networks-tab-detail-tasks-detail',
                    getCrumbs() { return []; }
                  };
                }
              }
            ]
          }
          // {
          //   type: Route,
          //   name: 'virtual-networks-tab-detail-tasks-details-logs',
          //   dontScroll: true,
          //   path: 'logs/:filePath?/?:innerPath?/?',
          //   handler: TaskLogsTab,
          //   title:'Logs'
          // }
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
      category: 'resources',
      isInSidebar: true,
      children
    };
  }
};

module.exports = RouteFactory;
