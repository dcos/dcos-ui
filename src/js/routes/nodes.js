import Router from 'react-router';
let Route = Router.Route;
let Redirect = Router.Redirect;

import HostTable from '../components/HostTable';
import NodesPage from '../pages/NodesPage';
import NodesGridView from '../components/NodesGridView';
import NodeDetailPage from '../pages/nodes/NodeDetailPage';

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
      path: 'node/:nodeID/?',
      handler: NodeDetailPage,
      children: [
        {
          type: Route,
          name: 'nodes-task-panel',
          path: 'task-detail/:taskID/?'
        },
        {
          type: Route,
          name: 'node-detail-tasks',
          path: 'task-detail/:taskID/?'
        },
        {
          type: Route,
          name: 'node-detail-health',
          path: ':unitNodeID/:unitID/?'
        },
      ]
    }
  ]
};

module.exports = nodesRoutes;
