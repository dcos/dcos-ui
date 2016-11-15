import {Redirect, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import DeploymentsTab from '../pages/services/DeploymentsTab';
import ServicesPage from '../pages/ServicesPage';
import ServicesContainer from '../containers/services/ServicesContainer';
import ServiceVolumeContainer from '../containers/volume-detail/ServiceVolumeContainer';
import TaskDetail from '../pages/task-details/TaskDetail';
import TaskDetailBreadcrumb from '../pages/nodes/breadcrumbs/TaskDetailBreadcrumb';
import TaskDetailsTab from '../pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../pages/task-details/TaskFilesTab';
import TaskFileViewer from '../pages/task-details/TaskFileViewer';
import TaskVolumeContainer from '../containers/volume-detail/TaskVolumeContainer';
import VolumeTable from '../components/VolumeTable';

function buildServiceCrumbs({id}) {
  id = decodeURIComponent(id).replace(/^\//, '');
  let ids = id.split('/');
  let aggregateIDs = '';

  return ids.map(function (id) {
    aggregateIDs += encodeURIComponent(`/${id}`);

    return {
      label: id,
      route: {to: `/services/overview/${aggregateIDs}`}
    };
  });
}

let serviceRoutes = [
  {
    type: Redirect,
    from: '/services',
    to: '/services/overview'
  },
  {
    type: Route,
    component: ServicesPage,
    path: 'services',
    category: 'root',
    isInSidebar: true,
    children: [
      {
        type: Route,
        component: ServicesContainer,
        path: 'overview',
        isInSidebar: true,
        buildBreadCrumb() {
          return {
            getCrumbs() {
              return [
                {
                  label: 'Services',
                  route: {to: '/services'}
                }
              ];
            }
          };
        },
        children: [
          {
            type: Route,
            path: ':id',
            component({children}) {
              return children;
            },
            buildBreadCrumb() {
              return {
                parentCrumb: '/services/overview',
                getCrumbs: buildServiceCrumbs
              };
            },
            children: [
              // This route needs to be rendered outside of the tabs that are
              // rendered in the service-task-details route.
              {
                type: Route,
                path: 'volumes/:volumeID',
                component: ServiceVolumeContainer,
                buildBreadCrumb() {
                  return {
                    parentCrumb: '/services/overview',
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
                path: 'tasks',
                component({children}) {
                  return children;
                },
                children: [
                  {
                    type: Redirect,
                    path: '/services/overview/:id/tasks/:taskID',
                    to: '/services/overview/:id/tasks/:taskID/details'
                  },
                  {
                    type: Route,
                    path: ':taskID',
                    component: TaskDetail,
                    hideHeaderNavigation: true,
                    buildBreadCrumb() {
                      return {
                        parentCrumb: '/services/overview/:id',
                        getCrumbs(params, routes) {
                          return [
                            <TaskDetailBreadcrumb
                                params={params}
                                routes={routes}
                                to="/services/overview/:id/tasks/:taskID"
                                routePath=":taskID" />
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
                        path: 'details',
                        title: 'Details',
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
                            getCrumbs() { return []; }
                          };
                        }
                      },
                      {
                        component: TaskFilesTab,
                        fileViewerRoutePath: '/services/overview/:id/tasks/:taskID/view(/:filePath(/:innerPath))',
                        hideHeaderNavigation: true,
                        isTab: true,
                        path: 'files',
                        title: 'Files',
                        type: Route,
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
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
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
                            getCrumbs() { return []; }
                          };
                        }
                      },
                      {
                        component: VolumeTable,
                        hideHeaderNavigation: true,
                        isTab: true,
                        path: 'volumes',
                        title: 'Volumes',
                        type: Route,
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
                            getCrumbs() { return []; }
                          };
                        }
                      },
                      {
                        type: Route,
                        hideHeaderNavigation: true,
                        path: 'volumes/:volumeID',
                        component: TaskVolumeContainer,
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID/volumes',
                            getCrumbs(params) {
                              return [
                                {
                                  label: 'Volumes',
                                  route: {
                                    params,
                                    to: '/services/overview/:id/tasks/:taskID/volumes'
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
        path: 'deployments',
        component: DeploymentsTab,
        isInSidebar: true
      }
    ]
  }
];

module.exports = serviceRoutes;
