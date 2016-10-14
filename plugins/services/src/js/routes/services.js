import {DefaultRoute, Redirect, Route} from 'react-router';
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

function buildServiceCrumbs(router) {
  let {id} = router.getCurrentParams();
  id = decodeURIComponent(id).replace(/^\//, '');
  let ids = id.split('/');
  let aggregateIDs = '';

  return ids.map(function (id) {
    aggregateIDs += encodeURIComponent(`/${id}`);

    return {
      label: id,
      route: {to: '/services/overview/:id', params: {id: aggregateIDs}}
    };
  });
}

let serviceRoutes = {
  type: Route,
  handler: ServicesPage,
  path: 'services',
  category: 'root',
  isInSidebar: true,
  children: [
    {
      type: Route,
      handler: ServicesContainer,
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
              handler: VolumeDetail,
              buildBreadCrumb() {
                return {
                  parentCrumb: '/services/overview',
                  getCrumbs(router) {
                    return [
                      {
                        label: router.getCurrentParams().volumeID
                      }
                    ];
                  }
                };
              }
            },
            {
              type: Route,
              path: 'tasks',
              children: [
                {
                  type: Route,
                  path: ':taskID',
                  handler: TaskDetail,
                  hideHeaderNavigation: true,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: '/services/overview/:id',
                      getCrumbs(router) {
                        return [
                          <TaskDetailBreadcrumb
                          parentRouter={router}
                          routePath="/services/overview/:id/tasks/:taskID" />
                        ];
                      }
                    };
                  },
                  children: [
                    {
                      type: DefaultRoute,
                      handler: TaskDetailsTab,
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
                      handler: TaskFilesTab,
                      isTab: true,
                      hideHeaderNavigation: true,
                      fileViewerRoutePath: '/services/overview/:id/tasks/:taskID/view/?:filePath?/?:innerPath?/?',
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
                      handler: TaskFileViewer,
                      title:'Logs',
                      path: 'view/?:filePath?/?:innerPath?/?',
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
                      handler: VolumeTable,
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
                      handler: VolumeDetail,
                      buildBreadCrumb() {
                        return {
                          parentCrumb: '/services/overview/:id/tasks/:taskID/volumes',
                          getCrumbs(router) {
                            return [
                              {
                                label: 'Volumes',
                                route: {
                                  params: router.getCurrentParams(),
                                  to: '/services/overview/:id/tasks/:taskID/volumes'
                                }
                              },
                              {
                                label: router.getCurrentParams().volumeID
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
      handler: DeploymentsTab,
      isInSidebar: true
    },
    {
      type: Redirect,
      from: '/services/?',
      to: '/services/overview'
    }
  ]
};

module.exports = serviceRoutes;
