import {DefaultRoute, Redirect, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import NodesTable from '../components/NodesTable';
import NodeDetailBreadcrumb from '../pages/nodes/breadcrumbs/NodeDetailBreadcrumb';
import NodeDetailPage from '../pages/nodes/NodeDetailPage';
import NodeDetailTab from '../pages/nodes/NodeDetailTab';
import NodeDetailHealthTab from '../pages/nodes/NodeDetailHealthTab';
import NodeDetailTaskTab from '../pages/nodes/NodeDetailTaskTab';
import NodesGridView from '../components/NodesGridView';
import NodesOverview from '../pages/NodesOverview';
import NodesPage from '../pages/NodesPage';
import TaskDetail from '../pages/task-details/TaskDetail';
import TaskDetailBreadcrumb from '../pages/nodes/breadcrumbs/TaskDetailBreadcrumb';
import TaskDetailsTab from '../pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../pages/task-details/TaskFilesTab';
import TaskFileViewer from '../pages/task-details/TaskFileViewer';
import UnitsHealthNodeDetail from '../pages/system/UnitsHealthNodeDetail';
import UnitsHealthDetailBreadcrumb from '../pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb';
import VolumeDetail from '../components/VolumeDetail';
import VolumeTable from '../components/VolumeTable';

let nodesRoutes = {
  type: Route,
  name: 'nodes-page',
  path: '/nodes/?',
  handler: NodesPage,
  category: 'resources',
  isInSidebar: true,
  buildBreadCrumb() {
    return {
      getCrumbs() {
        return [
          {
            label: 'Nodes',
            route: {to: 'nodes-page'}
          }
        ];
      }
    };
  },
  children: [
    {
      type: Route,
      name: 'nodes-overview',
      handler: NodesOverview,
      children: [
        {
          type: DefaultRoute,
          name: 'nodes-list',
          handler: NodesTable
        },
        {
          type: Route,
          name: 'nodes-grid',
          path: 'grid/?',
          handler: NodesGridView
        }
      ]
    },
    {
      type: Route,
      name: 'node-detail',
      path: '/nodes/:nodeID/?',
      handler: NodeDetailPage,
      children: [
        {
          type: Route,
          name: 'node-tasks-tab',
          title: 'Tasks',
          path: 'tasks/?',
          handler: NodeDetailTaskTab,
          buildBreadCrumb() {
            return {
              parentCrumb: 'nodes-page',
              getCrumbs(router) {
                return [
                  <NodeDetailBreadcrumb
                    parentRouter={router}
                    routeName="node-detail" />
                ];
              }
            };
          }
        },
        {
          type: Route,
          path: 'tasks/:taskID/?',
          name: 'nodes-task-details',
          handler: TaskDetail,
          hideHeaderNavigation: true,
          buildBreadCrumb() {
            return {
              parentCrumb: 'node-tasks-tab',
              getCrumbs(router) {
                return [
                  <TaskDetailBreadcrumb
                    parentRouter={router}
                    routeName="nodes-task-details" />
                ];
              }
            };
          },
          children: [
            {
              type: DefaultRoute,
              name: 'nodes-task-details-tab',
              handler: TaskDetailsTab,
              title:'Details',
              buildBreadCrumb() {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs() { return []; }
                };
              }
            },
            {
              type: Route,
              name: 'nodes-task-details-files',
              path: 'files/?',
              title:'Files',
              children: [
                {
                  type: DefaultRoute,
                  name: 'nodes-task-details-files-directory',
                  handler: TaskFilesTab,
                  fileViewerRouteName: 'nodes-task-details-files-viewer',
                  buildBreadCrumb() {
                    return {
                      parentCrumb: 'nodes-task-details',
                      getCrumbs() { return []; }
                    };
                  }
                },
                {
                  type: Route,
                  name: 'nodes-task-details-files-viewer',
                  path: 'view/:filePath?/?:innerPath?/?',
                  handler: TaskFileViewer,
                  dontScroll: true,
                  buildBreadCrumb() {
                    return {
                      parentCrumb: 'nodes-task-details',
                      getCrumbs() { return []; }
                    };
                  }
                }
              ]
            },
            {
              type: Route,
              name: 'nodes-task-details-volumes',
              path: 'volumes/:volumeID?',
              handler: VolumeTable,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs() { return []; }
                };
              },
              title: 'Volumes'
            }
          ]
        },
        // This route needs to be rendered outside of the tabs that are rendered
        // in the nodes-task-details route.
        {
          type: Route,
          name: 'item-volume-detail',
          path: 'tasks/:taskID/volumes/:volumeID/?',
          handler: VolumeDetail,
          buildBreadCrumb() {
            return {
              parentCrumb: 'node-detail',
              getCrumbs(router) {
                return [
                  {
                    label: 'Volumes',
                    route: {
                      params: router.getCurrentParams(),
                      to: 'nodes-task-details-volumes'
                    }
                  },
                  {
                    label: router.getCurrentParams().volumeID
                  }
                ];
              }
            };
          }
        },
        {
          type: Route,
          name: 'node-health-tab',
          path: 'health/?',
          title: 'Health',
          handler: NodeDetailHealthTab,
          buildBreadCrumb() {
            return {
              parentCrumb: 'nodes-page',
              getCrumbs(router) {
                return [
                  <NodeDetailBreadcrumb
                    parentRouter={router}
                    routeName="node-detail" />
                ];
              }
            };
          }
        },
        {
          type: Route,
          name: 'node-detail-health',
          path: 'health/:unitNodeID/:unitID/?',
          handler: UnitsHealthNodeDetail,
          buildBreadCrumb() {
            return {
              parentCrumb: 'node-health-tab',
              getCrumbs(router) {
                return [
                  <UnitsHealthDetailBreadcrumb
                    parentRouter={router}
                    routeName="node-detail-health" />
                ];
              }
            };
          }
        },
        {
          type: Route,
          name: 'node-details-tab',
          path: 'details/?',
          title: 'Details',
          handler: NodeDetailTab,
          buildBreadCrumb() {
            return {
              parentCrumb: 'nodes-page',
              getCrumbs(router) {
                return [
                  <NodeDetailBreadcrumb
                    parentRouter={router}
                    routeName="node-detail" />
                ];
              }
            };
          }
        },
        {
          type: Redirect,
          from: '/nodes/:nodeID/?',
          to: 'node-tasks-tab'
        }
      ]
    },
    {
      type: Redirect,
      path: '/nodes/?',
      to: 'nodes-overview'
    }
  ]
};

module.exports = nodesRoutes;
