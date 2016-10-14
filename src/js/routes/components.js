/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Route, DefaultRoute} from 'react-router';

import ComponentsPage from '../pages/ComponentsPage';
import UnitsHealthDetail from '../pages/system/UnitsHealthDetail';
import UnitsHealthNodeDetail from '../pages/system/UnitsHealthNodeDetail';
import UnitsHealthDetailBreadcrumb from '../pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb';
import UnitsHealthNodeDetailBreadcrumb from '../pages/system/breadcrumbs/UnitsHealthNodeDetailBreadcrumb';
import UnitsHealthTab from '../pages/system/UnitsHealthTab';

let componentsRoutes = {
  type: Route,
  path: 'components',
  handler: ComponentsPage,
  category: 'system',
  isInSidebar: true,
  buildBreadCrumb() {
    return {
      getCrumbs() {
        return [
          {
            label: 'System Components',
            route: {to: '/components'}
          }
        ];
      }
    };
  },
  children: [
    {
      type: DefaultRoute,
      handler: UnitsHealthTab
    },
    {
      type: Route,
      path: ':unitID',
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: '/components',
          getCrumbs(router) {
            return [
              <UnitsHealthDetailBreadcrumb
              parentRouter={router}
              routePath="/components/:unitID" />
            ];
          }
        };
      },
      children: [
        {
          type: DefaultRoute,
          handler: UnitsHealthDetail
        },
        {
          type: Route,
          path: 'nodes/:unitNodeID',
          handler: UnitsHealthNodeDetail,
          hideHeaderNavigation: true,
          buildBreadCrumb() {
            return {
              parentCrumb: '/components/:unitID',
              getCrumbs(router) {
                return [
                  <UnitsHealthNodeDetailBreadcrumb
                  parentRouter={router}
                  routePath="/components/:unitID/nodes/:unitNodeID"
                  />
                ];
              }
            };
          }
        }
      ]
    }
  ]
};

module.exports = componentsRoutes;
