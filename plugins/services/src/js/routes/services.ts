import { Redirect, Route, IndexRoute } from "react-router";

import FrameworkConfiguration from "#SRC/js/components/FrameworkConfiguration";
import NotFoundPage from "#SRC/js/pages/NotFoundPage";
import ServicesContainer from "../containers/services/ServicesContainer";
import CreateServiceModal from "../components/modals/CreateServiceModal";
import EditServiceModal from "../components/modals/EditServiceModal";
import ServiceRootGroupModal from "../components/modals/ServiceRootGroupModal";
import ServicesPage from "../pages/ServicesPage";
import ServiceTaskDetailPage from "../pages/task-details/ServiceTaskDetailPage";
import ServiceVolumeContainer from "../containers/volume-detail/ServiceVolumeContainer";
import TaskDetailsTab from "../pages/task-details/TaskDetailsTab";
import TaskFileBrowser from "../pages/task-details/TaskFileBrowser";
import TaskFilesTab from "../pages/task-details/TaskFilesTab";
import TaskFileViewer from "../pages/task-details/TaskFileViewer";
import TaskLogsContainer from "../pages/task-details/TaskLogsContainer";
import TaskVolumeContainer from "../containers/volume-detail/TaskVolumeContainer";
import VolumeTable from "../components/VolumeTable";
import PodVolumeTable from "../components/PodVolumeTable";
import HighOrderServiceConfiguration from "../components/HighOrderServiceConfiguration";
import SDKPlans from "../components/SDKPlans";
import HighOrderServiceDebug from "../components/HighOrderServiceDebug";
import HighOrderServiceInstances from "../components/HighOrderServiceInstances";
import ServiceConnectionContainer from "../components/ServiceConnectionContainer";
import PodVolumeContainer from "../containers/volume-detail/PodVolumeContainer";

const serviceRoutes = [
  {
    type: Redirect,
    from: "/services",
    to: "/services/overview",
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
            component: CreateServiceModal,
            isFullscreenModal: true,
          },
          {
            type: Route,
            path: "create_group",
            component: ServiceRootGroupModal,
            isFullscreenModal: true,
          },
          {
            type: Route,
            path: ":id",
            children: [
              {
                type: Route,
                path: "create",
                component: CreateServiceModal,
                isFullscreenModal: true,
              },
            ],
          },
        ],
      },
      // Service Quota routes
      {
        type: Route,
        component: ServicesContainer,
        path: "quota",
        children: [
          {
            type: Route,
            path: ":id",
          },
        ],
      },
      {
        type: Redirect,
        from: "/services/detail/:id",
        to: "/services/detail/:id/tasks",
      },
      {
        type: Route,
        path: "404",
        component: NotFoundPage,
      },
      {
        type: Route,
        component: ServicesContainer,
        path: "detail/:id",
        children: [
          {
            type: Route,
            path: "create",
            component: CreateServiceModal,
          },
          {
            type: Route,
            path: "edit(/:version)",
            component: EditServiceModal,
          },
          {
            type: Route,
            path: "frameworkconfiguration",
            component: FrameworkConfiguration,
          },
          // This route needs to be rendered outside of the tabs that are
          // rendered in the service-task-details route.
          {
            type: Route,
            path: "volumes/:volumeID",
            component: ServiceVolumeContainer,
          },
          {
            type: Route,
            path: "podvolumes/:volumeID",
            component: PodVolumeContainer,
          },
          {
            type: Route,
            path: "configuration",
            title: "Configuration",
            component: HighOrderServiceConfiguration,
          },
          {
            type: Route,
            path: "plans",
            title: "Plans",
            component: SDKPlans,
          },
          {
            type: Route,
            path: "debug",
            title: "Debug",
            component: HighOrderServiceDebug,
          },
          {
            type: Route,
            path: "volumes",
            title: "Volumes",
            component: VolumeTable,
          },
          {
            type: Route,
            path: "podvolumes",
            title: "Volumes",
            component: PodVolumeTable,
          },
          {
            type: Route,
            title: "Instances",
            path: "tasks",
            component: HighOrderServiceInstances,
          },
          {
            type: Route,
            path: "endpoints",
            title: "Endpoints",
            component: ServiceConnectionContainer,
          },
          {
            type: Redirect,
            path: "/services/detail/:id/tasks/:taskID",
            to: "/services/detail/:id/tasks/:taskID/details",
          },
          {
            type: Route,
            title: "Instances",
            path: "tasks/:taskID",
            component: ServiceTaskDetailPage,
            children: [
              {
                type: Route,
                component: TaskDetailsTab,
                path: "details",
                title: "Details",
              },
              {
                component: TaskFilesTab,
                path: "files",
                title: "Files",
                type: Route,
                children: [
                  {
                    component: TaskFileBrowser,
                    fileViewerRoutePath:
                      "/services/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))",
                    type: IndexRoute,
                  },
                  {
                    component: TaskFileViewer,
                    path: "view(/:filePath(/:innerPath))",
                    type: Route,
                  },
                ],
              },
              {
                component: TaskLogsContainer,
                path: "logs",
                title: "Logs",
                type: Route,
                children: [
                  {
                    path: ":filePath",
                    type: Route,
                  },
                ],
              },
              {
                component: VolumeTable,
                path: "volumes",
                title: "Volumes",
                type: Route,
              },
              {
                component: PodVolumeTable,
                path: "podvolumes",
                title: "Volumes",
                type: Route,
              },
              {
                type: Route,
                path: "volumes/:volumeID",
                component: TaskVolumeContainer,
              },
            ],
          },
        ],
      },
    ],
  },
];

export default serviceRoutes;
