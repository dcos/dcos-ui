import {Redirect, IndexRoute, Route} from 'react-router';
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

function buildJobCrumbs({id}) {
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
  component: JobsPage,
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
      type: IndexRoute,
      component: JobsTab
    },
    {
      type: Route,
      component: JobsTab,
      children: [
        {
          type: Route,
          component: JobDetailPage,
          path: ':id',
          buildBreadCrumb() {
            return {
              parentCrumb: '/jobs',
              getCrumbs: buildJobCrumbs
            };
          },
          children:[
            {
              type: Redirect,
              path: '/jobs/:id/tasks/:taskID',
              to: '/jobs/:id/tasks/:taskID/details'
            },
            {
              type: Route,
              path: 'tasks/:taskID',
              component: TaskDetail,
              hideHeaderNavigation: true,
              buildBreadCrumb() {
                return {
                  parentCrumb: '/jobs/:id',
                  getCrumbs(params, routes) {
                    return [
                      <TaskDetailBreadcrumb
                        params={params}
                        routes={routes}
                        to="/jobs/:id/tasks/:taskID"
                        routePath="tasks/:taskID" />
                    ];
                  }
                };
              },
              children: [
                {
                  component: TaskDetailsTab,
                  isTab: true,
                  path: 'details',
                  title: 'Details',
                  type: Route,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: '/jobs/:id/tasks/:taskID',
                      getCrumbs() { return []; }
                    };
                  }
                },
                {
                  component: TaskFilesTab,
                  fileViewerRoutePath: '/jobs/:id/tasks/:taskID/view(/:filePath(/:innerPath))',
                  isTab: true,
                  path: 'files',
                  title: 'Files',
                  type: Route,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: '/jobs/:id/tasks/:taskID',
                      getCrumbs() { return []; }
                    };
                  }
                },
                {
                  component: TaskFileViewer,
                  dontScroll: true,
                  isTab: true,
                  path: 'view(/:filePath(/:innerPath))',
                  title: 'Logs',
                  type: Route,
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
