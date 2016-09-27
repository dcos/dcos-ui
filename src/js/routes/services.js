import {DefaultRoute, Redirect, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import DeploymentsTab from '../pages/services/DeploymentsTab';
import ServicesPage from '../pages/ServicesPage';
import ServicesTab from '../pages/services/ServicesTab';
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
      route: {to: 'services-detail', params: {id: aggregateIDs}}
    };
  });
}

let serviceRoutes = {
  type: Route,
  name: 'services-page',
  handler: ServicesPage,
  path: '/services/?',
  category: 'root',
  isInSidebar: true,
  children: [
    {
      type: Route,
      handler: ServicesTab,
      name: 'services-overview',
      path: 'overview/',
      isInSidebar: true,
      buildBreadCrumb() {
        return {
          getCrumbs() {
            return [
              {
                label: 'Services',
                route: {to: 'services-page'}
              }
            ];
          }
        };
      },
      children: [
        {
          type: Route,
          name: 'services-detail',
          path: ':id/?',
          buildBreadCrumb() {
            return {
              parentCrumb: 'services-overview',
              getCrumbs: buildServiceCrumbs
            };
          },
          children: [
            // This route needs to be rendered outside of the tabs that are
            // rendered in the service-task-details route.
            {
              type: Route,
              name: 'service-volume-details',
              path: 'volumes/:volumeID/?',
              handler: VolumeDetail,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'services-overview',
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
              name: 'service-task-details-volume-details',
              path: 'tasks/:taskID/volumes/:volumeID/?',
              handler: VolumeDetail,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'services-task-details-volumes',
                  getCrumbs(router) {
                    return [
                      {
                        label: 'Volumes',
                        route: {
                          params: router.getCurrentParams(),
                          to: 'services-task-details-volumes'
                        }
                      },
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
              path: 'tasks/:taskID/?',
              name: 'services-task-details',
              handler: TaskDetail,
              hideHeaderNavigation: true,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'services-overview',
                  getCrumbs(router) {
                    return [
                      <TaskDetailBreadcrumb
                        parentRouter={router}
                        routeName="services-task-details" />
                    ];
                  }
                };
              },
              children: [
                {
                  type: DefaultRoute,
                  name: 'services-task-details-tab',
                  handler: TaskDetailsTab,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: 'services-task-details',
                      getCrumbs() { return []; }
                    };
                  },
                  title:'Details'
                },
                {
                  type: Route,
                  path: 'files/?',
                  name: 'services-task-details-files',
                  title:'Files',
                  children: [
                    {
                      type: DefaultRoute,
                      name: 'services-task-details-files-directory',
                      handler: TaskFilesTab,
                      fileViewerRouteName: 'services-task-details-files-viewer',
                      buildBreadCrumb() {
                        return {
                          parentCrumb: 'services-task-details',
                          getCrumbs() { return []; }
                        };
                      }
                    },
                    {
                      type: Route,
                      name: 'services-task-details-files-viewer',
                      path: 'view/:filePath?/?:innerPath?/?',
                      handler: TaskFileViewer,
                      dontScroll: true,
                      buildBreadCrumb() {
                        return {
                          parentCrumb: 'services-task-details',
                          getCrumbs() { return []; }
                        };
                      }
                    }
                  ]
                },
                // {
                //   type: Route,
                //   name: 'services-task-details-logs',
                //   dontScroll: true,
                //   path: 'logs/:filePath?/?:innerPath?/?',
                //   handler: TaskLogsTab,
                //   title:'Logs'
                // },
                {
                  type: Route,
                  name: 'services-task-details-volumes',
                  path: 'volumes/?',
                  handler: VolumeTable,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: 'services-task-details',
                      getCrumbs() { return []; }
                    };
                  },
                  title:'Volumes'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: Route,
      name: 'services-deployments',
      path: 'deployments/',
      handler: DeploymentsTab,
      isInSidebar: true
    },
    {
      type: Redirect,
      from: '/services/?',
      to: 'services-overview'
    }
  ]
};

module.exports = serviceRoutes;
