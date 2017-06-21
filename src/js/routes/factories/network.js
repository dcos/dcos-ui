/* eslint-disable no-unused-vars */
import React, { PropTypes } from "react";
/* eslint-enable no-unused-vars */
import { IndexRoute, Route, Redirect } from "react-router";

import { Hooks } from "PluginSDK";
import NetworkPage from "../../pages/NetworkPage";
import TaskDetailsTab
  from "../../../../plugins/services/src/js/pages/task-details/TaskDetailsTab";
import TaskFileBrowser
  from "../../../../plugins/services/src/js/pages/task-details/TaskFileBrowser";
import TaskFilesTab
  from "../../../../plugins/services/src/js/pages/task-details/TaskFilesTab";
import TaskFileViewer
  from "../../../../plugins/services/src/js/pages/task-details/TaskFileViewer";
import TaskLogsContainer
  from "../../../../plugins/services/src/js/pages/task-details/TaskLogsContainer";
import VirtualNetworkDetail
  from "../../pages/network/virtual-network-detail/VirtualNetworkDetail";
import VirtualNetworkDetailsTab
  from "../../pages/network/virtual-network-detail/VirtualNetworkDetailsTab";
import VirtualNetworksTab from "../../pages/network/VirtualNetworksTab";
import VirtualNetworkTaskPage
  from "../../pages/network/virtual-network-detail/VirtualNetworkTaskPage";
import VirtualNetworkTaskTab
  from "../../pages/network/virtual-network-detail/VirtualNetworkTaskTab";

const RouteFactory = {
  getNetworkRoutes() {
    const virtualNetworksRoute = [
      {
        type: Route,
        path: "networks",
        component: VirtualNetworksTab,
        isInSidebar: true,
        buildBreadCrumb() {
          return {
            getCrumbs() {
              return [
                {
                  label: "Networks",
                  route: { to: "/networking/networks" }
                }
              ];
            }
          };
        }
      },
      {
        type: Route,
        path: "networks/:overlayName",
        component: VirtualNetworkDetail,
        children: [
          {
            type: IndexRoute,
            component: VirtualNetworkTaskTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: "/networking/networks",
                getCrumbs(params) {
                  const { overlayName } = params;

                  return [
                    {
                      label: overlayName,
                      route: {
                        to: "/networking/networks/:overlayName",
                        params: { overlayName }
                      }
                    }
                  ];
                }
              };
            }
          },
          {
            type: Route,
            path: "details",
            component: VirtualNetworkDetailsTab,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: "/networking/networks",
                getCrumbs(params) {
                  const { overlayName } = params;

                  return [
                    {
                      label: overlayName,
                      route: {
                        to: "/networking/networks/:overlayName",
                        params: { overlayName }
                      }
                    }
                  ];
                }
              };
            }
          }
        ]
      },
      {
        type: Redirect,
        path: "/networking/networks/:overlayName/tasks/:taskID",
        to: "/networking/networks/:overlayName/tasks/:taskID/details"
      },
      {
        type: Route,
        path: "networks/:overlayName/tasks/:taskID",
        component: VirtualNetworkTaskPage,
        hideHeaderNavigation: true,
        buildBreadCrumb() {
          return {
            parentCrumb: "/networking/networks/:overlayName/tasks",
            getCrumbs(params) {
              return [{ label: params.taskID }];
            }
          };
        },
        children: [
          {
            component: TaskDetailsTab,
            hideHeaderNavigation: true,
            isTab: true,
            path: "details",
            title: "Details",
            type: Route,
            buildBreadCrumb() {
              return {
                parentCrumb: "/networking/networks/:overlayName/tasks/:taskID",
                getCrumbs() {
                  return [];
                }
              };
            }
          },
          {
            hideHeaderNavigation: true,
            component: TaskFilesTab,
            isTab: true,
            path: "files",
            title: "Files",
            type: Route,
            children: [
              {
                component: TaskFileBrowser,
                fileViewerRoutePath: "/networking/networks/:overlayName/tasks/:taskID/files/view(/:filePath(/:innerPath))",
                hideHeaderNavigation: true,
                type: IndexRoute,
                buildBreadCrumb() {
                  return {
                    parentCrumb: "/networking/networks/:overlayName/tasks/:taskID",
                    getCrumbs() {
                      return [];
                    }
                  };
                }
              },
              {
                component: TaskFileViewer,
                hideHeaderNavigation: true,
                path: "view(/:filePath(/:innerPath))",
                type: Route,
                buildBreadCrumb() {
                  return {
                    parentCrumb: "/networking/networks/:overlayName/tasks/:taskID",
                    getCrumbs() {
                      return [];
                    }
                  };
                }
              }
            ]
          },
          {
            component: TaskLogsContainer,
            hideHeaderNavigation: true,
            isTab: true,
            path: "logs",
            title: "Logs",
            type: Route,
            buildBreadCrumb() {
              return {
                parentCrumb: "/networking/networks/:overlayName/tasks/:taskID",
                getCrumbs() {
                  return [];
                }
              };
            },
            children: [
              {
                path: ":filePath",
                type: Route
              }
            ]
          }
        ]
      }
    ];

    // Return filtered Routes
    // Pass in Object so Plugins can mutate routes and the default redirect
    return Hooks.applyFilter("networkRoutes", {
      routes: virtualNetworksRoute,
      redirect: {
        type: Redirect,
        from: "/networking",
        to: "/networking/networks"
      }
    });
  },

  getRoutes() {
    const { routes, redirect } = this.getNetworkRoutes();

    return [
      // Redirect should always go before path, otherwise router won't ever reach it
      redirect,
      {
        type: Route,
        path: "networking",
        component: NetworkPage,
        category: "resources",
        isInSidebar: true,
        children: routes
      }
    ];
  }
};

module.exports = RouteFactory;
