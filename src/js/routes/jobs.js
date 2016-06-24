import {DefaultRoute, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import JobDetailPage from '../pages/jobs/JobDetailPage';
import JobsPage from '../pages/JobsPage';
import JobsTab from '../pages/jobs/JobsTab';

import TaskDetail from '../pages/task-details/TaskDetail';
import TaskDetailsTab  from '../pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../pages/task-details/TaskFilesTab';
import TaskLogsTab from '../pages/task-details/TaskLogsTab';

let jobsRoutes = {
  type: Route,
  name: 'jobs-page',
  handler: JobsPage,
  path: '/jobs/?',
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
          hideHeaderNavigation: true,
          children:[
            {
              type: Route,
              path: 'tasks/:taskID/?',
              name: 'jobs-task-details',
              handler: TaskDetail,
              hideHeaderNavigation: true,
              children: [
                {
                  type: DefaultRoute,
                  name: 'jobs-task-details-tab',
                  handler: TaskDetailsTab,
                  hideHeaderNavigation: true,
                  title:'Details'
                },
                {
                  type: Route,
                  name: 'jobs-task-details-files',
                  path: 'files/?',
                  handler: TaskFilesTab,
                  hideHeaderNavigation: true,
                  title:'Files'
                },
                {
                  type: Route,
                  name: 'jobs-task-details-logs',
                  dontScroll: true,
                  path: 'logs/?',
                  handler: TaskLogsTab,
                  hideHeaderNavigation: true,
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
