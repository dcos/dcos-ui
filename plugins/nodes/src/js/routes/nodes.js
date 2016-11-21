import {IndexRoute, Route, Redirect} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import NodeDetailBreadcrumb from '../pages/nodes/breadcrumbs/NodeDetailBreadcrumb';
import NodeDetailHealthTab from '../pages/nodes/NodeDetailHealthTab';
import NodeDetailPage from '../pages/nodes/NodeDetailPage';
import NodeDetailTab from '../pages/nodes/NodeDetailTab';
import NodeDetailTaskTab from '../pages/nodes/NodeDetailTaskTab';
import NodesGridContainer from '../pages/nodes/nodes-grid/NodesGridContainer';
import NodesOverview from '../pages/NodesOverview';
import NodesPage from '../pages/NodesPage';

import NodesTableContainer from '../pages/nodes/nodes-table/NodesTableContainer';
import TaskDetail from '../../../../services/src/js/pages/task-details/TaskDetail';
import TaskDetailBreadcrumb from '../../../../services/src/js/pages/nodes/breadcrumbs/TaskDetailBreadcrumb';
import TaskDetailsTab from '../../../../services/src/js/pages/task-details/TaskDetailsTab';
import TaskFileViewer from '../../../../services/src/js/pages/task-details/TaskFileViewer';
import TaskFilesTab from '../../../../services/src/js/pages/task-details/TaskFilesTab';
import TaskVolumeContainer from '../../../../services/src/js/containers/volume-detail/TaskVolumeContainer';
import UnitsHealthDetailBreadcrumb from '../../../../../src/js/pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb';
import UnitsHealthNodeDetail from '../../../../../src/js/pages/system/UnitsHealthNodeDetail';
import VolumeTable from '../../../../services/src/js/components/VolumeTable';

let nodesRoutes = {
  type: Route,
  path: 'nodes',
  component: NodesPage,
  category: 'resources',
  isInSidebar: true,
  buildBreadCrumb() {
    return {
      getCrumbs() {
        return [
          {
            label: 'Nodes',
            route: {to: '/nodes'}
          }
        ];
      }
    };
  },
  children: [
    {
      type: Route,
      component: NodesOverview,
      children: [
        {
          type: IndexRoute,
          component: NodesTableContainer
        },
        {
          type: Route,
          path: 'grid',
          component: NodesGridContainer
        }
      ]
    },
    {
      type: Redirect,
      from: '/nodes/:nodeID',
      to: '/nodes/:nodeID/tasks'
    },
    {
      type: Route,
      path: ':nodeID',
      component: NodeDetailPage,
      buildBreadCrumb() {
        return {
          parentCrumb: '/nodes',
          getCrumbs(params, routes) {
            return [
              <NodeDetailBreadcrumb
                params={params}
                routes={routes}
                to="/nodes/:nodeID"
                routePath=":nodeID" />
            ];
          }
        };
      },
      children: [
        {
          type: Route,
          title: 'Tasks',
          path: 'tasks',
          component: NodeDetailTaskTab
        },
        {
          type: Redirect,
          path: '/nodes/:nodeID/tasks/:taskID',
          to: '/nodes/:nodeID/tasks/:taskID/details'
        },
        {
          type: Route,
          path: 'tasks/:taskID',
          component: TaskDetail,
          hideHeaderNavigation: true,
          buildBreadCrumb() {
            return {
              parentCrumb: '/nodes/:nodeID',
              getCrumbs(params, routes) {
                return [
                  <TaskDetailBreadcrumb
                    params={params}
                    routes={routes}
                    to="/nodes/:nodeID/tasks/:taskID"
                    routePath="tasks/:taskID" />
                ];
              }
            };
          },
          children: [
            {
              type: Route,
              component: TaskDetailsTab,
              hideHeaderNavigation: true,
              title: 'Details',
              path: 'details',
              isTab: true,
              hideHeaderNavigation: true,
              buildBreadCrumb() {
                return {
                  parentCrumb: '/nodes/:nodeID/tasks/:taskID',
                  getCrumbs() { return []; }
                };
              }
            },
            {
              type: Route,
              path: 'files',
              isTab: true,
              component: TaskFilesTab,
              title: 'Files',
              hideHeaderNavigation: true,
              fileViewerRoutePath: '/nodes/:nodeID/tasks/:taskID/view(/:filePath(/:innerPath))',
              buildBreadCrumb() {
                return {
                  parentCrumb: '/nodes/:nodeID/tasks/:taskID',
                  getCrumbs() { return []; }
                };
              }
            },
            {
              type: Route,
              component: TaskFileViewer,
              dontScroll: true,
              title: 'Logs',
              isTab: true,
              path: 'view(/:filePath(/:innerPath))',
              hideHeaderNavigation: true,
              buildBreadCrumb() {
                return {
                  parentCrumb: '/nodes/:nodeID/tasks/:taskID',
                  getCrumbs() { return []; }
                };
              }
            },
            {
              component: VolumeTable,
              hideHeaderNavigation: true,
              isTab: true,
              path: 'volumes',
              title: 'Volumes',
              type: Route,
              buildBreadCrumb() {
                return {
                  parentCrumb: '/nodes/:nodeID/tasks/:taskID',
                  getCrumbs() { return []; }
                };
              }
            }
          ]
        },
        // This route needs to be rendered outside of the tabs that are rendered
        // in the nodes-task-details route.
        {
          type: Route,
          path: 'tasks/:taskID/volumes/:volumeID',
          component: TaskVolumeContainer,
          buildBreadCrumb() {
            return {
              parentCrumb: '/nodes/:nodeID/tasks/:taskID',
              getCrumbs(params) {
                return [
                  {
                    label: 'Volumes',
                    route: {
                      params,
                      to: '/nodes/:nodeID/tasks/:taskID/volumes/:volumeID'
                    }
                  },
                  {
                    label: params.volumeID
                  }
                ];
              }
            };
          }
        },
        {
          type: Route,
          path: 'health',
          title: 'Health',
          component: NodeDetailHealthTab,
          buildBreadCrumb() {
            return {
              parentCrumb: '/nodes',
              getCrumbs(params, routes) {
                return [
                  <NodeDetailBreadcrumb
                    params={params}
                    routes={routes}
                    to="/nodes/:nodeID"
                    routePath="health" />
                ];
              }
            };
          }
        },
        {
          type: Route,
          path: 'health/:unitNodeID/:unitID',
          component: UnitsHealthNodeDetail,
          buildBreadCrumb() {
            return {
              parentCrumb: '/nodes/:nodeID/health',
              getCrumbs(params, routes) {
                return [
                  <UnitsHealthDetailBreadcrumb
                    params={params}
                    routes={routes}
                    to="/nodes/:nodeID/health/:unitNodeID/:unitID"
                    routePath="health/:unitNodeID/:unitID" />
                ];
              }
            };
          }
        },
        {
          type: Route,
          path: 'details',
          title: 'Details',
          component: NodeDetailTab,
          buildBreadCrumb() {
            return {
              parentCrumb: '/nodes',
              getCrumbs(params, routes) {
                return [
                  <NodeDetailBreadcrumb
                    params={params}
                    routes={routes}
                    to="/nodes/:nodeID"
                    routePath="details" />
                ];
              }
            };
          }
        }
      ]
    }
  ]
};

module.exports = nodesRoutes;
