import {DefaultRoute, Route} from 'react-router';

import HostTable from '../components/HostTable';
import NodesPage from '../pages/NodesPage';
import NodesGridView from '../components/NodesGridView';
import NodeDetailPage from '../pages/nodes/NodeDetailPage';
import TaskDetail from '../pages/services/task-details/TaskDetail';
import TaskFilesTab from '../pages/services/task-details/TaskFilesTab';
import TaskLogsTab from '../pages/services/task-details/TaskLogsTab';
import TaskDetailsTab from '../pages/services/task-details/TaskDetailsTab';

let nodesRoutes = {
  type: Route,
  name: 'nodes',
  children: [
    {
      type: Route,
      name: 'nodes-page',
      path: '/nodes/?',
      handler: NodesPage,
      children: [
        {
          type: Route,
          name: 'nodes-list',
          path: 'list/?',
          handler: HostTable
        },
        {
          type: Route,
          name: 'nodes-grid',
          path: 'grid/?',
          handler: NodesGridView
        },
        {
          type: Redirect,
          from: '/nodes/?',
          to: 'nodes-list'
        }
      ]
    },
    {
      type: Route,
      name: 'node-detail',
      path: ':nodeID/?',
      handler: NodeDetailPage,
      children: [
        {
          type: Route,
          path: 'tasks/:taskID/?',
          name: 'nodes-task-details',
          handler: TaskDetail,
          children: [
            {
              type: DefaultRoute,
              name: 'nodes-task-details-tab',
              handler: TaskDetailsTab
            },
            {
              type: Route,
              name: 'nodes-task-details-files',
              path: 'files/?',
              handler: TaskFilesTab
            },
            {
              type: Route,
              name: 'nodes-task-details-logs',
              path: 'logs/?',
              handler: TaskLogsTab
            }
          ]
        },
        {
          type: Route,
          name: 'node-detail-health',
          path: ':unitNodeID/:unitID/?'
        }
      ]
    }
  ]
};

module.exports = nodesRoutes;
