import {Route} from 'react-router';

import JobDetailPage from '../pages/jobs/JobDetailPage';
import JobsPage from '../pages/JobsPage';
import JobsTab from '../pages/jobs/JobsTab';
import TaskDetail from '../pages/services/task-details/TaskDetail';

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
              name: 'jobs-task-details-tab',
              handler: TaskDetail,
              path: ':taskID/?'
            }
          ]
        }
      ]
    }
  ]
};

module.exports = jobsRoutes;
