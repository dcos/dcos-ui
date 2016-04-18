import Router from 'react-router';
let Route = Router.Route;
let Redirect = Router.Redirect;

import HostTable from '../components/HostTable';
import NodesPage from '../pages/NodesPage';
import NodesGridView from '../components/NodesGridView';

let nodesRoutes = {
  type: Route,
  name: 'nodes',
  path: 'nodes/?',
  handler: NodesPage,
  children: [
    {
      type: Route,
      name: 'nodes-list',
      path: 'list/?',
      handler: HostTable,
      children: [
        {
          type: Route,
          name: 'nodes-list-panel',
          path: 'node-detail/:nodeID/?',
          children: [
            {
              type: Route,
              name: 'nodes-list-panel-health',
              path: ':unitNodeID/:unitID/?'
            }
          ]
        },
        {
          type: Route,
          name: 'nodes-list-task-panel',
          path: 'task-detail/:taskID/?'
        }
      ]
    },
    {
      type: Route,
      name: 'nodes-grid',
      path: 'grid/?',
      handler: NodesGridView,
      children: [
        {
          type: Route,
          name: 'nodes-grid-panel',
          path: 'node-detail/:nodeID/?',
          children: [
            {
              type: Route,
              name: 'nodes-grid-panel-health',
              path: ':unitNodeID/:unitID/?'
            }
          ]
        },
        {
          type: Route,
          name: 'nodes-grid-task-panel',
          path: 'task-detail/:taskID/?'
        }
      ]
    },
    {
      type: Redirect,
      from: '/nodes/?',
      to: 'nodes-list'
    }
  ]
};

module.exports = nodesRoutes;
