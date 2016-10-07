/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Route, Redirect} from 'react-router';

import ComponentsPage from '../pages/ComponentsPage';
import UnitsHealthDetail from '../pages/system/UnitsHealthDetail';
import UnitsHealthNodeDetail from '../pages/system/UnitsHealthNodeDetail';
import UnitsHealthDetailBreadcrumb from '../pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb';
import UnitsHealthNodeDetailBreadcrumb from '../pages/system/breadcrumbs/UnitsHealthNodeDetailBreadcrumb';
import UnitsHealthTab from '../pages/system/UnitsHealthTab';

let componentsRoutes = {
  type: Route,
  name: 'components',
  path: 'components',
  component: ComponentsPage,
  category: 'system',
  isInSidebar: true,
  children: [
    {
      type: Route,
      name: 'components-overview-units',
      path: 'overview',
      component: UnitsHealthTab,
      buildBreadCrumb() {
        return {
          getCrumbs() {
            return [
              {
                label: 'System Components',
                route: {to: 'components-overview-units'}
              }
            ];
          }
        };
      }
    },
    {
      type: Route,
      name: 'components-overview-units-unit-nodes-detail',
      path: 'components/:unitID',
      component: UnitsHealthDetail,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: 'components-overview-units',
          getCrumbs(router) {
            return [
              <UnitsHealthDetailBreadcrumb
                parentRouter={router}
                routeName="components-overview-units-unit-nodes-detail" />
            ];
          }
        };
      }
    },
    {
      type: Route,
      name: 'components-overview-units-unit-nodes-node-detail',
      path: 'components/:unitID/nodes/:unitNodeID',
      component: UnitsHealthNodeDetail,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: 'components-overview-units-unit-nodes-detail',
          getCrumbs(router) {
            return [
              <UnitsHealthNodeDetailBreadcrumb
                parentRouter={router}
                routeName="components-overview-units-unit-nodes-node-detail"
                />
            ];
          }
        };
      }
    },
    {
      type: Redirect,
      from: '/components',
      to: 'components-overview-units'
    }
  ]
};

module.exports = componentsRoutes;
