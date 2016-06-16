import {DefaultRoute, Redirect, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import HostTable from '../components/HostTable';
import NodeDetailBreadcrumb from '../pages/nodes/breadcrumbs/NodeDetailBreadcrumb';
import NodeDetailPage from '../pages/nodes/NodeDetailPage';
import NodesGridView from '../components/NodesGridView';
import NodesPage from '../pages/NodesPage';
import UnitsHealthNodeDetail from '../pages/system/UnitsHealthNodeDetail';
import UnitsHealthNodeDetailPage from '../pages/nodes/UnitsHealthNodeDetailPage';
import TaskDetail from '../pages/services/task-details/TaskDetail';
import TaskDetailsTab from '../pages/services/task-details/TaskDetailsTab';
import TaskFilesTab from '../pages/services/task-details/TaskFilesTab';
import TaskLogsTab from '../pages/services/task-details/TaskLogsTab';
import TaskDetailBreadcrumb from '../pages/nodes/breadcrumbs/TaskDetailBreadcrumb';

let nodesRoutes = {
  type: Route,
  name: 'nodes',
  children: [
    {
      type: Route,
      name: 'nodes-page',
      path: '/nodes/?',
      handler: NodesPage,
      buildBreadCrumb: function () {
        return {
          getCrumbs: function () {
            return [
              {
                label: 'Nodes',
                route: {to: 'nodes-page'}
              }
            ];
          }
        }
      },
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
      hideHeaderNavigation: true,
      buildBreadCrumb: function () {
        return {
          parentCrumb: 'nodes-page',
          getCrumbs: function (router) {
            return [
              <NodeDetailBreadcrumb
                parentRouter={router}
                routeName="node-detail" />
            ];
          }
        }
      },
      children: [
        {
          type: Route,
          path: 'tasks/:taskID/?',
          name: 'nodes-task-details',
          handler: TaskDetail,
          hideHeaderNavigation: true,
          buildBreadCrumb: function () {
            return {
              parentCrumb: 'node-detail',
              getCrumbs: function (router) {
                return [
                  <TaskDetailBreadcrumb
                    parentRouter={router}
                    routeName="nodes-task-details" />
                ];
              }
            }
          },
          children: [
            {
              type: DefaultRoute,
              name: 'nodes-task-details-tab',
              handler: TaskDetailsTab,
              hideHeaderNavigation: true,
              buildBreadCrumb: function () {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs: function () { return []; }
                }
              }
            },
            {
              type: Route,
              name: 'nodes-task-details-files',
              path: 'files/?',
              handler: TaskFilesTab,
              hideHeaderNavigation: true,
              buildBreadCrumb: function () {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs: function () { return []; }
                }
              }
            },
            {
              type: Route,
              name: 'nodes-task-details-logs',
              dontScroll: true,
              path: 'logs/?',
              handler: TaskLogsTab,
              hideHeaderNavigation: true,
              buildBreadCrumb: function () {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs: function () { return []; }
                }
              }
            }
          ]
        }
      ]
    },
    {
      type: Route,
      name: 'node-detail-health',
      path: ':nodeID/:unitNodeID/:unitID/?',
      handler: UnitsHealthNodeDetailPage,
      hideHeaderNavigation: true,
      children: [
        {
          type: DefaultRoute,
          handler: UnitsHealthNodeDetail
        }
      ]
    }
  ]
};

module.exports = nodesRoutes;
