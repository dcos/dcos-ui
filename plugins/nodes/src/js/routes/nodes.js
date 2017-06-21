import { IndexRoute, Route, Redirect } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import NodeDetailBreadcrumb
  from "../pages/nodes/breadcrumbs/NodeDetailBreadcrumb";
import NodeDetailHealthTab from "../pages/nodes/NodeDetailHealthTab";
import NodeDetailPage from "../pages/nodes/NodeDetailPage";
import NodeDetailTab from "../pages/nodes/NodeDetailTab";
import NodeDetailTaskTab from "../pages/nodes/NodeDetailTaskTab";
import NodesGridContainer from "../pages/nodes/nodes-grid/NodesGridContainer";
import NodesOverview from "../pages/NodesOverview";
import NodesPage from "../pages/NodesPage";
import NodesTableContainer
  from "../pages/nodes/nodes-table/NodesTableContainer";
import NodesTaskDetailPage from "../pages/nodes/NodesTaskDetailPage";
import TaskDetailBreadcrumb
  from "../../../../services/src/js/pages/nodes/breadcrumbs/TaskDetailBreadcrumb";
import TaskDetailsTab
  from "../../../../services/src/js/pages/task-details/TaskDetailsTab";
import TaskFileBrowser
  from "../../../../services/src/js/pages/task-details/TaskFileBrowser";
import TaskFilesTab
  from "../../../../services/src/js/pages/task-details/TaskFilesTab";
import TaskFileViewer
  from "../../../../services/src/js/pages/task-details/TaskFileViewer";
import TaskLogsContainer
  from "../../../../services/src/js/pages/task-details/TaskLogsContainer";
import TaskVolumeContainer
  from "../../../../services/src/js/containers/volume-detail/TaskVolumeContainer";
import UnitsHealthDetailBreadcrumb
  from "../../../../../src/js/pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb";
import NodesUnitsHealthDetailPage
  from "../pages/nodes/NodesUnitsHealthDetailPage";
import VolumeTable from "../../../../services/src/js/components/VolumeTable";

const nodesRoutes = {
  type: Route,
  path: "nodes",
  component: NodesPage,
  category: "resources",
  isInSidebar: true,
  buildBreadCrumb() {
    return {
      getCrumbs() {
        return [
          {
            label: "Nodes",
            route: { to: "/nodes" }
          }
        ];
      }
    };
  },
  children: [
    {
      type: Route,
      component: NodesOverview,
      children: [
        {
          type: IndexRoute,
          component: NodesTableContainer
        },
        {
          type: Route,
          path: "grid",
          component: NodesGridContainer
        }
      ]
    },
    {
      type: Redirect,
      from: "/nodes/:nodeID",
      to: "/nodes/:nodeID/tasks"
    },
    {
      type: Route,
      path: ":nodeID",
      component: NodeDetailPage,
      buildBreadCrumb() {
        return {
          parentCrumb: "/nodes",
          getCrumbs(params, routes) {
            return [
              <NodeDetailBreadcrumb
                params={params}
                routes={routes}
                to="/nodes/:nodeID"
                routePath=":nodeID"
              />
            ];
          }
        };
      },
      children: [
        {
          type: Route,
          title: "Tasks",
          path: "tasks",
          component: NodeDetailTaskTab
        },
        {
          type: Redirect,
          path: "/nodes/:nodeID/tasks/:taskID",
          to: "/nodes/:nodeID/tasks/:taskID/details"
        },
        {
          type: Route,
          path: "health",
          title: "Health",
          component: NodeDetailHealthTab,
          buildBreadCrumb() {
            return {
              parentCrumb: "/nodes",
              getCrumbs(params, routes) {
                return [
                  <NodeDetailBreadcrumb
                    params={params}
                    routes={routes}
                    to="/nodes/:nodeID"
                    routePath="health"
                  />
                ];
              }
            };
          }
        },
        {
          type: Route,
          path: "details",
          title: "Details",
          component: NodeDetailTab,
          buildBreadCrumb() {
            return {
              parentCrumb: "/nodes",
              getCrumbs(params, routes) {
                return [
                  <NodeDetailBreadcrumb
                    params={params}
                    routes={routes}
                    to="/nodes/:nodeID"
                    routePath="details"
                  />
                ];
              }
            };
          }
        }
      ]
    },
    {
      type: Route,
      path: ":nodeID/tasks/:taskID",
      component: NodesTaskDetailPage,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: "/nodes/:nodeID",
          getCrumbs(params, routes) {
            return [
              <TaskDetailBreadcrumb
                params={params}
                routes={routes}
                to="/nodes/:nodeID/tasks/:taskID"
                routePath="tasks/:taskID"
              />
            ];
          }
        };
      },
      children: [
        {
          type: Route,
          component: TaskDetailsTab,
          hideHeaderNavigation: true,
          title: "Details",
          path: "details",
          isTab: true,
          buildBreadCrumb() {
            return {
              parentCrumb: "/nodes/:nodeID/tasks/:taskID",
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
              fileViewerRoutePath: "/nodes/:nodeID/tasks/:taskID/files/view(/:filePath(/:innerPath))",
              hideHeaderNavigation: true,
              type: IndexRoute,
              buildBreadCrumb() {
                return {
                  parentCrumb: "/nodes/:nodeID/tasks/:taskID",
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
                  parentCrumb: "/nodes/:nodeID/tasks/:taskID",
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
              parentCrumb: "/nodes/:nodeID/tasks/:taskID",
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
        },
        {
          component: VolumeTable,
          hideHeaderNavigation: true,
          isTab: true,
          path: "volumes",
          title: "Volumes",
          type: Route,
          buildBreadCrumb() {
            return {
              parentCrumb: "/nodes/:nodeID/tasks/:taskID",
              getCrumbs() {
                return [];
              }
            };
          }
        }
      ]
    },
    // This route needs to be rendered outside of the tabs that are rendered
    // in the nodes-task-details route.
    {
      type: Route,
      path: ":nodeID/tasks/:taskID/volumes/:volumeID",
      component: TaskVolumeContainer,
      buildBreadCrumb() {
        return {
          parentCrumb: "/nodes/:nodeID/tasks/:taskID",
          getCrumbs(params) {
            return [
              {
                label: "Volumes",
                route: {
                  params,
                  to: "/nodes/:nodeID/tasks/:taskID/volumes/:volumeID"
                }
              },
              {
                label: params.volumeID
              }
            ];
          }
        };
      }
    },
    // This needs to be outside of the children array of node routes
    // so that it can be responsible for rendering its own header.
    {
      type: Route,
      path: ":nodeID/health/:unitNodeID/:unitID",
      component: NodesUnitsHealthDetailPage,
      buildBreadCrumb() {
        return {
          parentCrumb: "/nodes/:nodeID/health",
          getCrumbs(params, routes) {
            return [
              <UnitsHealthDetailBreadcrumb
                params={params}
                routes={routes}
                to="/nodes/:nodeID/health/:unitNodeID/:unitID"
                routePath="health/:unitNodeID/:unitID"
              />
            ];
          }
        };
      }
    }
  ]
};

module.exports = nodesRoutes;
