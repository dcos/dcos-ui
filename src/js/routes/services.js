import {DefaultRoute, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import DeploymentsTab from '../pages/services/DeploymentsTab';
import ItemVolumeDetail from '../components/ItemVolumeDetail';
import ItemVolumeTable from '../components/ItemVolumeTable';
import ServicesPage from '../pages/ServicesPage';
import ServicesTab from '../pages/services/ServicesTab';
import TaskDetail from '../pages/services/task-details/TaskDetail';
import TaskDetailsTab from '../pages/services/task-details/TaskDetailsTab';
import TaskFilesTab from '../pages/services/task-details/TaskFilesTab';
import TaskLogsTab from '../pages/services/task-details/TaskLogsTab';
import TaskDetailBreadcrumb from '../pages/nodes/breadcrumbs/TaskDetailBreadcrumb';

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
  buildBreadCrumb: function () {
    return {
      getCrumbs: function () {
        return [
          {
            label: 'Services',
            route: {to: 'services-page'}
          }
        ];
      }
    }
  },
  children: [
    {
      type: Route,
      name: 'services-deployments',
      path: 'deployments/',
      handler: DeploymentsTab
    },
    {
      type: Route,
      handler: ServicesTab,
      children: [
        {
          type: Route,
          name: 'services-detail',
          path: ':id/?',
          hideHeaderNavigation: true,
          buildBreadCrumb: function () {
            return {
              parentCrumb: 'services-page',
              getCrumbs: buildServiceCrumbs
            }
          },
          children: [
            // This route needs to be rendered outside of the tabs that are
            // rendered in the service-task-details route.
            {
              type: Route,
              name: 'service-volume-details',
              path: 'volumes/:volumeID/?',
              handler: ItemVolumeDetail,
              buildBreadCrumb: function () {
                return {
                  parentCrumb: 'services-detail',
                  getCrumbs: function (router) {
                    return [
                      {
                        label: router.getCurrentParams().volumeID
                      }
                    ];
                  }
                }
              }
            },
            {
              type: Route,
              name: 'service-task-details-volume-details',
              path: 'tasks/:taskID/volumes/:volumeID/?',
              handler: ItemVolumeDetail,
              buildBreadCrumb: function () {
                return {
                  parentCrumb: 'services-task-details-volumes',
                  getCrumbs: function (router) {
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
                }
              }
            },
            {
              type: Route,
              path: 'tasks/:taskID/?',
              name: 'services-task-details',
              handler: TaskDetail,
              hideHeaderNavigation: true,
              buildBreadCrumb: function () {
                return {
                  parentCrumb: 'services-detail',
                  getCrumbs: function (router) {
                    return [
                      <TaskDetailBreadcrumb
                        parentRouter={router}
                        routeName="services-task-details" />
                    ];
                  }
                }
              },
              children: [
                {
                  type: DefaultRoute,
                  name: 'services-task-details-tab',
                  handler: TaskDetailsTab,
                  hideHeaderNavigation: true,
                  buildBreadCrumb: function () {
                    return {
                      parentCrumb: 'services-task-details',
                      getCrumbs: function () { return []; }
                    }
                  }
                },
                {
                  type: Route,
                  name: 'services-task-details-files',
                  path: 'files/?',
                  handler: TaskFilesTab,
                  hideHeaderNavigation: true,
                  buildBreadCrumb: function () {
                    return {
                      parentCrumb: 'services-task-details',
                      getCrumbs: function () { return []; }
                    }
                  }
                },
                {
                  type: Route,
                  name: 'services-task-details-logs',
                  dontScroll: true,
                  path: 'logs/?',
                  handler: TaskLogsTab,
                  hideHeaderNavigation: true,
                  buildBreadCrumb: function () {
                    return {
                      parentCrumb: 'services-task-details',
                      getCrumbs: function () { return []; }
                    }
                  }
                },
                {
                  type: Route,
                  name: 'services-task-details-volumes',
                  path: 'volumes/?',
                  handler: ItemVolumeTable,
                  buildBreadCrumb: function () {
                    return {
                      parentCrumb: 'services-task-details',
                      getCrumbs: function () { return []; }
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = serviceRoutes;
