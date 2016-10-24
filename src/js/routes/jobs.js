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
import TaskFileViewer from '../../../plugins/services/src/js/pages/task-details/TaskFileViewer';

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
      route: {to: '/jobs/:id', params: {id: aggregateIDs}}
    };
  });
}

let jobsRoutes = {
  type: Route,
  handler: JobsPage,
  path: 'jobs',
  category: 'root',
  isInSidebar: true,
  buildBreadCrumb() {
    return {
      getCrumbs() {
        return [
          {
            label: 'Jobs',
            route: {to: '/jobs'}
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
          path: ':id',
          buildBreadCrumb() {
            return {
              parentCrumb: '/jobs',
              getCrumbs: buildJobCrumbs
            };
          },
          children:[
            {
              type: Route,
              path: 'tasks/:taskID',
              handler: TaskDetail,
              hideHeaderNavigation: true,
              buildBreadCrumb() {
                return {
                  parentCrumb: '/jobs/:id',
                  getCrumbs(router) {
                    return [
                      <TaskDetailBreadcrumb
                        parentRouter={router}
                        routePath="/jobs/:id/tasks/:taskID" />
                    ];
                  }
                };
              },
              children: [
                {
                  type: DefaultRoute,
                  handler: TaskDetailsTab,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: '/jobs/:id/tasks/:taskID',
                      getCrumbs() { return []; }
                    };
                  },
                  title:'Details'
                },
                {
                  type: Route,
                  path: 'files',
                  handler: TaskFilesTab,
                  fileViewerRoutePath: '/jobs/:id/tasks/:taskID/view/:filePath?/?:innerPath?',
                  buildBreadCrumb() {
                    return {
                      parentCrumb: '/jobs/:id/tasks/:taskID',
                      getCrumbs() { return []; }
                    };
                  }
                },
                {
                  type: Route,
                  path: 'view/:filePath?/?:innerPath?',
                  handler: TaskFileViewer,
                  dontScroll: true,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: '/jobs/:id/tasks/:taskID',
                      getCrumbs() { return []; }
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
};

module.exports = jobsRoutes;
