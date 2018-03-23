import { Redirect, Route, IndexRoute } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import FrameworkConfiguration from "#SRC/js/components/FrameworkConfiguration";
import NotFoundPage from "#SRC/js/pages/NotFoundPage";
import ServicesContainer from "../containers/services/ServicesContainer";
import CreateServiceModal from "../components/modals/CreateServiceModal";
import EditServiceModal from "../components/modals/EditServiceModal";
import ServicesPage from "../pages/ServicesPage";
import ServiceTaskDetailPage from "../pages/task-details/ServiceTaskDetailPage";
import ServiceVolumeContainer
  from "../containers/volume-detail/ServiceVolumeContainer";
import TaskDetailsTab from "../pages/task-details/TaskDetailsTab";
import TaskFileBrowser from "../pages/task-details/TaskFileBrowser";
import TaskFilesTab from "../pages/task-details/TaskFilesTab";
import TaskFileViewer from "../pages/task-details/TaskFileViewer";
import TaskLogsContainer from "../pages/task-details/TaskLogsContainer";
import TaskVolumeContainer
  from "../containers/volume-detail/TaskVolumeContainer";
import VolumeTable from "../components/VolumeTable";
import PodVolumeTable from "../components/PodVolumeTable";
import HighOrderServiceConfiguration
  from "../components/HighOrderServiceConfiguration";
import HighOrderServiceDebug from "../components/HighOrderServiceDebug";
import HighOrderServiceInstances from "../components/HighOrderServiceInstances";
import ServiceConnectionContainer
  from "../components/ServiceConnectionContainer";
import PodVolumeContainer from "../containers/volume-detail/PodVolumeContainer";

const serviceRoutes = [
  {
    type: Redirect,
    from: "/services",
    to: "/services/overview"
  },
  {
    type: Route,
    component: ServicesPage,
    path: "services",
    category: "root",
    isInSidebar: true,
    children: [
      // Service Tree View routes
      {
        type: Route,
        component: ServicesContainer,
        path: "overview",
        children: [
          {
            type: Route,
            path: "create",
            component: CreateServiceModal
          },
          {
            type: Route,
            path: ":id",
            children: [
              {
                type: Route,
                path: "create",
                component: CreateServiceModal
              }
            ]
          }
        ]
      },
      // Service Detail routes
      {
        type: Redirect,
        from: "/services/detail/:id",
        to: "/services/detail/:id/tasks"
      },
      {
        type: Route,
        path: "404",
        component: NotFoundPage
      },
      {
        type: Route,
        component: ServicesContainer,
        path: "detail/:id",
        children: [
          {
            type: Route,
            path: "create",
            component: CreateServiceModal
          },
          {
            type: Route,
            path: "edit(/:version)",
            component: EditServiceModal
          },
          {
            type: Route,
            path: "frameworkconfiguration",
            component: FrameworkConfiguration
          },
          // This route needs to be rendered outside of the tabs that are
          // rendered in the service-task-details route.
          {
            type: Route,
            path: "volumes/:volumeID",
            component: ServiceVolumeContainer
          },
          {
            type: Route,
            path: "podvolumes/:volumeID",
            component: PodVolumeContainer
          },
          {
            type: Route,
            path: "configuration",
            title: "Configuration",
            component: HighOrderServiceConfiguration
          },
          {
            type: Route,
            path: "debug",
            title: "Debug",
            component: HighOrderServiceDebug
          },
          {
            type: Route,
            path: "volumes",
            title: "Volumes",
            component: VolumeTable
          },
          {
            type: Route,
            path: "podvolumes",
            title: "Volumes",
            component: PodVolumeTable
          },
          {
            type: Route,
            title: "Instances",
            path: "tasks",
            component: HighOrderServiceInstances
          },
          {
            type: Route,
            path: "endpoints",
            title: "Endpoints",
            component: ServiceConnectionContainer
          },
          {
            type: Redirect,
            path: "/services/detail/:id/tasks/:taskID",
            to: "/services/detail/:id/tasks/:taskID/details"
          },
          {
            type: Route,
            title: "Instances",
            path: "tasks/:taskID",
            component: ServiceTaskDetailPage,
            hideHeaderNavigation: true,
            children: [
              {
                type: Route,
                component: TaskDetailsTab,
                hideHeaderNavigation: true,
                isTab: true,
                path: "details",
                title: "Details"
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
                    fileViewerRoutePath: "/services/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))",
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
              },
              {
                component: PodVolumeTable,
                hideHeaderNavigation: true,
                isTab: true,
                path: "podvolumes",
                title: "Volumes",
                type: Route
              },
              {
                type: Route,
                hideHeaderNavigation: true,
                path: "volumes/:volumeID",
                component: TaskVolumeContainer
              }
            ]
          }
        ]
      }
    ]
  }
];

module.exports = serviceRoutes;
