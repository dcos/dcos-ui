import {IndexRoute, Redirect, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import DeploymentsTab from '../pages/services/DeploymentsTab';
import ServicesPage from '../pages/ServicesPage';
import ServicesContainer from '../services/ServicesContainer';
import TaskDetail from '../pages/task-details/TaskDetail';
import TaskDetailsTab from '../pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../pages/task-details/TaskFilesTab';
import TaskFileViewer from '../pages/task-details/TaskFileViewer';
import TaskDetailBreadcrumb from '../pages/nodes/breadcrumbs/TaskDetailBreadcrumb';
import VolumeDetail from '../components/VolumeDetail';
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
                component: VolumeDetail,
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
                                routePath=":taskID" />
                          ];
                        }
                      };
                    },
                    children: [
                      {
                        type: IndexRoute,
                        component: TaskDetailsTab,
                        isTab: true,
                        title:'Details',
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
                            getCrumbs() { return []; }
                          };
                        }
                      },
                      {
                        type: Route,
                        path: 'files',
                        title:'Files',
                        component: TaskFilesTab,
                        isTab: true,
                        hideHeaderNavigation: true,
                        fileViewerRoutePath: '/services/overview/:id/tasks/:taskID/view/?:filePath?/?:innerPath?',
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
                            getCrumbs() { return []; }
                          };
                        }
                      },
                      {
                        type: Route,
                        dontScroll: true,
                        component: TaskFileViewer,
                        title:'Logs',
                        path: 'view/?:filePath?/?:innerPath?',
                        isTab: true,
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
                            getCrumbs() { return []; }
                          };
                        }
                      },
                      {
                        type: Route,
                        path: 'volumes',
                        component: VolumeTable,
                        isTab: true,
                        title:'Volumes',
                        buildBreadCrumb() {
                          return {
                            parentCrumb: '/services/overview/:id/tasks/:taskID',
                            getCrumbs() { return []; }
                          };
                        }
                      },
                      {
                        type: Route,
                        path: 'volumes/:volumeID',
                        component: VolumeDetail,
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
