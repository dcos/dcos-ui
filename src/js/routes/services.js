import {DefaultRoute, Route} from 'react-router';

import DeploymentsTab from '../pages/services/DeploymentsTab';
import ServiceOverlay from '../components/ServiceOverlay';
import ServicesPage from '../pages/ServicesPage';
import ServicesTab from '../pages/services/ServicesTab';
import TaskDetail from '../pages/services/task-details/TaskDetail';
import TaskDetailsTab from '../pages/services/task-details/TaskDetailsTab';
import TaskFilesTab from '../pages/services/task-details/TaskFilesTab';
import TaskLogsTab from '../pages/services/task-details/TaskLogsTab';

let serviceRoutes = {
  type: Route,
  name: 'services-page',
  handler: ServicesPage,
  path: '/services/?',
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
          children: [
            {
              type: Route,
              path: 'tasks/:taskID/?',
              name: 'services-task-details',
              handler: TaskDetail,
              children: [
                {
                  type: DefaultRoute,
                  name: 'services-task-details-tab',
                  handler: TaskDetailsTab
                },
                {
                  type: Route,
                  name: 'services-task-details-files',
                  path: 'files/?',
                  handler: TaskFilesTab
                },
                {
                  type: Route,
                  name: 'services-task-details-logs',
                  path: 'logs/?',
                  handler: TaskLogsTab
                }
              ]
            }
          ]
        },
        {
          type: Route,
          name: 'service-ui',
          path: 'ui/:serviceName/?',
          handler: ServiceOverlay
        },
        {
          type: Route,
          name: 'services-panel',
          path: 'service-detail/:serviceName/?'
        }
      ]
    }
  ]
};

module.exports = serviceRoutes;
