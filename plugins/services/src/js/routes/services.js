import { Redirect, Route, IndexRoute } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import DeploymentsTab from "../pages/services/DeploymentsTab";
import ServicesContainer from "../containers/services/ServicesContainer";
import NewCreateServiceModal from "../components/modals/NewCreateServiceModal";
import ServicesPage from "../pages/ServicesPage";
import ServiceTaskDetailPage from "../pages/task-details/ServiceTaskDetailPage";
import ServiceVolumeContainer
  from "../containers/volume-detail/ServiceVolumeContainer";
import TaskDetailBreadcrumb
  from "../pages/nodes/breadcrumbs/TaskDetailBreadcrumb";
import TaskDetailsTab from "../pages/task-details/TaskDetailsTab";
import TaskFileBrowser from "../pages/task-details/TaskFileBrowser";
import TaskFilesTab from "../pages/task-details/TaskFilesTab";
import TaskFileViewer from "../pages/task-details/TaskFileViewer";
import TaskLogsContainer from "../pages/task-details/TaskLogsContainer";
import TaskVolumeContainer
  from "../containers/volume-detail/TaskVolumeContainer";
import VolumeTable from "../components/VolumeTable";

function buildServiceCrumbs({ id }) {
  id = decodeURIComponent(id).replace(/^\//, "");
  const ids = id.split("/");
  let aggregateIDs = "";

  return ids.map(function(id) {
    aggregateIDs += encodeURIComponent(`/${id}`);

    return {
      label: id,
      route: { to: `/services/overview/${aggregateIDs}` }
    };
  });
}

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
      {
        type: Route,
        component: ServicesContainer,
        path: "overview",
        isInSidebar: true,
        buildBreadCrumb() {
          return {
            getCrumbs() {
              return [
                {
                  label: "Services",
                  route: { to: "/services" }
                }
              ];
            }
          };
        },
        children: [
          {
            type: Route,
            path: "create",
            component: NewCreateServiceModal,
            buildBreadCrumb() {
              return {
                parentCrumb: "/services/overview",
                getCrumbs: buildServiceCrumbs
              };
            }
          },
          {
            type: Route,
            path: ":id",
            buildBreadCrumb() {
              return {
                parentCrumb: "/services/overview",
                getCrumbs: buildServiceCrumbs
              };
            },
            children: [
              {
                type: Route,
                path: "create",
                component: NewCreateServiceModal,
                buildBreadCrumb(params) {
                  return {
                    parentCrumb: `/services/overview/${params.id}`,
                    getCrumbs: buildServiceCrumbs
                  };
                }
              },
              {
                type: Route,
                path: "edit(/:version)",
                component: NewCreateServiceModal,
                buildBreadCrumb(params) {
                  return {
                    parentCrumb: `/services/overview/${params.id}`,
                    getCrumbs: buildServiceCrumbs
                  };
                }
              },
              // This route needs to be rendered outside of the tabs that are
              // rendered in the service-task-details route.
              {
                type: Route,
                path: "volumes/:volumeID",
                component: ServiceVolumeContainer,
                buildBreadCrumb() {
                  return {
                    parentCrumb: "/services/overview",
                    getCrumbs(params) {
                      return [
                        {
                          label: params.volumeID
                        }
                      ];
                    }
                  };
                }
              },
              {
                type: Route,
                path: "tasks",
                component({ children }) {
                  return children;
                },
                children: [
                  {
                    type: Redirect,
                    path: "/services/overview/:id/tasks/:taskID",
                    to: "/services/overview/:id/tasks/:taskID/details"
                  },
                  {
                    type: Route,
                    path: ":taskID",
                    component: ServiceTaskDetailPage,
                    hideHeaderNavigation: true,
                    buildBreadCrumb() {
                      return {
                        parentCrumb: "/services/overview/:id",
                        getCrumbs(params, routes) {
                          return [
                            <TaskDetailBreadcrumb
                              params={params}
                              routes={routes}
                              to="/services/overview/:id/tasks/:taskID"
                              routePath=":taskID"
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
                        isTab: true,
                        path: "details",
                        title: "Details",
                        buildBreadCrumb() {
                          return {
                            parentCrumb: "/services/overview/:id/tasks/:taskID",
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
                            fileViewerRoutePath: "/services/overview/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))",
                            hideHeaderNavigation: true,
                            type: IndexRoute,
                            buildBreadCrumb() {
                              return {
                                parentCrumb: "/services/overview/:id/tasks/:taskID",
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
                                parentCrumb: "/services/overview/:id/tasks/:taskID",
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
                            parentCrumb: "/services/overview/:id/tasks/:taskID",
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
                            parentCrumb: "/services/overview/:id/tasks/:taskID",
                            getCrumbs() {
                              return [];
                            }
                          };
                        }
                      },
                      {
                        type: Route,
                        hideHeaderNavigation: true,
                        path: "volumes/:volumeID",
                        component: TaskVolumeContainer,
                        buildBreadCrumb() {
                          return {
                            parentCrumb: "/services/overview/:id/tasks/:taskID/volumes",
                            getCrumbs(params) {
                              return [
                                {
                                  label: "Volumes",
                                  route: {
                                    params,
                                    to: "/services/overview/:id/tasks/:taskID/volumes"
                                  }
                                },
                                {
                                  label: params.volumeID
                                }
                              ];
                            }
                          };
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        type: Route,
        path: "deployments",
        component: DeploymentsTab,
        isInSidebar: true
      }
    ]
  }
];

module.exports = serviceRoutes;
