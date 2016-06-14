import {DefaultRoute, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import DeploymentsTab from '../pages/services/DeploymentsTab';
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
          buildBreadCrumb: function () {
            return {
              parentCrumb: 'services-page',
              getCrumbs: buildServiceCrumbs
            }
          },
          children: [
            {
              type: Route,
              path: 'tasks/:taskID/?',
              name: 'services-task-details',
              handler: TaskDetail,
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
                  path: 'logs/?',
                  handler: TaskLogsTab,
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
