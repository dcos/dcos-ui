import {DefaultRoute, Route} from 'react-router';

import JobDetailPage from '../pages/jobs/JobDetailPage';
import JobsPage from '../pages/JobsPage';
import JobsTab from '../pages/jobs/JobsTab';
import JobsTaskDetail from '../pages/jobs/JobsTaskDetail';
import JobsTaskDetailsTab from '../pages/jobs/JobsTaskDetailsTab';
import TaskFilesTab from '../pages/services/task-details/TaskFilesTab';
import TaskLogsTab from '../pages/services/task-details/TaskLogsTab';

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
          children: [
            {
              type: Route,
              name: 'jobs-task-details',
              handler: JobsTaskDetail,
              path: ':taskID/?',
              children: [
                {
                  type: DefaultRoute,
                  name: 'jobs-task-details-tab',
                  handler: JobsTaskDetailsTab
                },
                {
                  type: Route,
                  name: 'jobs-task-details-files',
                  path: 'files/?',
                  handler: TaskFilesTab
                },
                {
                  type: Route,
                  name: 'jobs-task-details-logs',
                  path: 'logs/?',
                  handler: TaskLogsTab
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
