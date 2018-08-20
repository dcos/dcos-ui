import { IndexRoute, Route, Redirect } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import NodeDetailHealthTab from "../pages/nodes/NodeDetailHealthTab";
import NodeDetailPage from "../pages/nodes/NodeDetailPage";
import NodeDetailTab from "../pages/nodes/NodeDetailTab";
import NodeDetailTaskTab from "../pages/nodes/NodeDetailTaskTab";
import NodesGridContainer from "../pages/nodes/nodes-grid/NodesGridContainer";
import NodesAgents from "../pages/NodesAgents";
import NodesMasters from "../pages/NodesMasters";
import NodesPage from "../pages/NodesPage";
import NodesTableContainer from "../pages/nodes/nodes-table/NodesTableContainer";
import NodesTaskDetailPage from "../pages/nodes/NodesTaskDetailPage";
import TaskDetailsTab from "../../../../services/src/js/pages/task-details/TaskDetailsTab";
import TaskFileBrowser from "../../../../services/src/js/pages/task-details/TaskFileBrowser";
import TaskFilesTab from "../../../../services/src/js/pages/task-details/TaskFilesTab";
import TaskFileViewer from "../../../../services/src/js/pages/task-details/TaskFileViewer";
import TaskLogsContainer from "../../../../services/src/js/pages/task-details/TaskLogsContainer";
import TaskVolumeContainer from "../../../../services/src/js/containers/volume-detail/TaskVolumeContainer";
import NodesUnitsHealthDetailPage from "../pages/nodes/NodesUnitsHealthDetailPage";
import VolumeTable from "../../../../services/src/js/components/VolumeTable";

const nodesRoutes = [
  {
    type: Redirect,
    from: "/nodes",
    to: "/nodes/agents/table"
  },
  {
    type: Redirect,
    from: "/nodes/grid",
    to: "/nodes/agents/grid"
  },
  {
    type: Route,
    path: "nodes",
    component: NodesPage,
    category: "resources",
    isInSidebar: true,
    children: [
      {
        type: Redirect,
        from: "/nodes/agents",
        to: "/nodes/agents/table"
      },
      {
        type: Route,
        path: "agents",
        component: NodesAgents,
        children: [
          {
            type: Route,
            component: NodesTableContainer,
            path: "table"
          },
          {
            type: Route,
            component: NodesGridContainer,
            path: "grid"
          }
        ]
      },
      {
        type: Route,
        path: "masters",
        component: NodesMasters
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
            component: NodeDetailHealthTab
          },
          {
            type: Route,
            path: "details",
            title: "Details",
            component: NodeDetailTab
          }
        ]
      },
      {
        type: Route,
        path: ":nodeID/tasks/:taskID",
        component: NodesTaskDetailPage,
        hideHeaderNavigation: true,
        children: [
          {
            type: Route,
            component: TaskDetailsTab,
            hideHeaderNavigation: true,
            title: "Details",
            path: "details",
            isTab: true
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
                fileViewerRoutePath:
                  "/nodes/:nodeID/tasks/:taskID/files/view(/:filePath(/:innerPath))",
                hideHeaderNavigation: true,
                type: IndexRoute
              },
              {
                component: TaskFileViewer,
                hideHeaderNavigation: true,
                path: "view(/:filePath(/:innerPath))",
                type: Route
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
            type: Route
          }
        ]
      },
      // This route needs to be rendered outside of the tabs that are rendered
      // in the nodes-task-details route.
      {
        type: Route,
        path: ":nodeID/tasks/:taskID/volumes/:volumeID",
        component: TaskVolumeContainer
      },
      // This needs to be outside of the children array of node routes
      // so that it can be responsible for rendering its own header.
      {
        type: Route,
        path: ":nodeID/health/:unitNodeID/:unitID",
        component: NodesUnitsHealthDetailPage
      }
    ]
  }
];

module.exports = nodesRoutes;
