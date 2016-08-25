import {DefaultRoute, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import JobDetailPage from '../pages/jobs/JobDetailPage';
import JobsPage from '../pages/JobsPage';
import JobsTab from '../pages/jobs/JobsTab';
import TaskDetail from '../../../plugins/services/src/js/pages/task-details/TaskDetail';
import TaskDetailBreadcrumb from '../../../plugins/services/src/js/pages/nodes/breadcrumbs/TaskDetailBreadcrumb';
import TaskDetailsTab from '../../../plugins/services/src/js/pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../../../plugins/services/src/js/pages/task-details/TaskFilesTab';
import TaskLogsTab from '../../../plugins/services/src/js/pages/task-details/TaskLogsTab';

function buildJobCrumbs(router) {
  let {id} = router.getCurrentParams();
  let ids = id.split('.');
  let aggregateIDs = '';

  return ids.map(function (id) {
    if (aggregateIDs !== '') {
      aggregateIDs += '.';
    }
    aggregateIDs += id;

    return {
      label: id,
      route: {to: 'jobs-page-detail', params: {id: aggregateIDs}}
    };
  });
}

let jobsRoutes = {
  type: Route,
  name: 'jobs-page',
  handler: JobsPage,
  path: '/jobs/?',
  category: 'root',
  isInSidebar: true,
  buildBreadCrumb() {
    return {
      getCrumbs() {
        return [
          {
            label: 'Jobs',
            route: {to: 'jobs-page'}
          }
        ];
      }
    };
  },
  children: [
    {
      type: Route,
      handler: JobsTab,
      children: [
        {
          type: Route,
          handler: JobDetailPage,
          name: 'jobs-page-detail',
          path: ':id/?',
          buildBreadCrumb() {
            return {
              parentCrumb: 'jobs-page',
              getCrumbs: buildJobCrumbs
            };
          },
          children:[
            {
              type: Route,
              path: 'tasks/:taskID/?',
              name: 'jobs-task-details',
              handler: TaskDetail,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'jobs-page-detail',
                  getCrumbs(router) {
                    return [
                      <TaskDetailBreadcrumb
                        parentRouter={router}
                        routeName="jobs-task-details" />
                    ];
                  }
                };
              },
              children: [
                {
                  type: DefaultRoute,
                  name: 'jobs-task-details-tab',
                  handler: TaskDetailsTab,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: 'jobs-task-details',
                      getCrumbs() { return []; }
                    };
                  },
                  title:'Details'
                },
                {
                  type: Route,
                  name: 'jobs-task-details-files',
                  path: 'files/?',
                  handler: TaskFilesTab,
                  logRouteName: 'jobs-task-details-logs',
                  buildBreadCrumb() {
                    return {
                      parentCrumb: 'jobs-task-details',
                      getCrumbs() { return []; }
                    };
                  },
                  title:'Files'
                },
                {
                  type: Route,
                  name: 'jobs-task-details-logs',
                  dontScroll: true,
                  path: 'logs/:filePath?/?:innerPath?/?',
                  handler: TaskLogsTab,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: 'jobs-task-details',
                      getCrumbs() { return []; }
                    };
                  },
                  title:'Logs'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = jobsRoutes;
