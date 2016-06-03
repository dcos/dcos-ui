import {Route} from 'react-router';

import JobDetailPage from '../pages/jobs/JobDetailPage';
import JobsPage from '../pages/JobsPage';
import JobsTab from '../pages/jobs/JobsTab';

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
          path: ':jobID/?'
        }
      ]
    }
  ]
};

module.exports = jobsRoutes;
