import {Route} from 'react-router';

import JobsPage from '../pages/JobsPage';
import JobsTab from '../pages/jobs/JobsTab';

let jobsRoutes = {
  type: Route,
  name: 'jobs',
  handler: JobsPage,
  path: '/jobs/?',
  children: [
    {
      type: Route,
      handler: JobsTab,
      children: [
        {
          type: Route,
          name: 'jobs-detail',
          path: ':id/?'
        }
      ]
    }
  ]
};

module.exports = jobsRoutes;
