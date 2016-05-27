/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {Route, Redirect} from 'react-router';

import {Hooks} from 'PluginSDK';
import RepositoriesTab from '../../pages/system/RepositoriesTab';
import SystemPage from '../../pages/SystemPage';
import UnitsHealthDetail from '../../pages/system/UnitsHealthDetail';
import UnitsHealthNodeDetail from '../../pages/system/UnitsHealthNodeDetail';
import UnitsHealthDetailBreadcrumb from '../../pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb';
import UnitsHealthNodeDetailBreadcrumb from '../../pages/system/breadcrumbs/UnitsHealthNodeDetailBreadcrumb';
import UnitsHealthTab from '../../pages/system/UnitsHealthTab';
import UsersTab from '../../pages/system/UsersTab';

let RouteFactory = {

  getOverviewRoutes() {
    // Return filtered Routes
    return this.getFilteredRoutes(
      Hooks.applyFilter('OverviewRoutes', {
        routes: [
          {
            type: Route,
            name: 'system-overview-units',
            path: 'components/?',
            handler: UnitsHealthTab,
            buildBreadCrumb: function () {
              return {
                getCrumbs: function () {
                  return [
                    {
                      label: 'System Components',
                      route: {to: 'system-overview-units'}
                    }
                  ]
                }
              }
            }
          },
          {
            type: Route,
            name: 'system-overview-units-unit-nodes-detail',
            path: 'components/:unitID/?',
            handler: UnitsHealthDetail,
            buildBreadCrumb: function () {
              return {
                parentCrumb: 'system-overview-units',
                getCrumbs: function (router) {
                  return [
                    <UnitsHealthDetailBreadcrumb
                      parentRouter={router}
                      routeName="system-overview-units-unit-nodes-detail" />
                  ]
                }
              }
            }
          },
          {
            type: Route,
            name: 'system-overview-units-unit-nodes-node-detail',
            path: 'components/:unitID/nodes/:unitNodeID/?',
            handler: UnitsHealthNodeDetail,
            buildBreadCrumb: function () {
              return {
                parentCrumb: 'system-overview-units-unit-nodes-detail',
                getCrumbs: function (router) {
                  return [
                    <UnitsHealthNodeDetailBreadcrumb
                      parentRouter={router}
                      routeName="system-overview-units-unit-nodes-node-detail"
                      />
                  ]
                }
              }
            }
          },
          {
            type: Route,
            name: 'system-overview-repositories',
            path: 'repositories/?',
            handler: RepositoriesTab
          }
        ],
        redirect: {
          type: Redirect,
          from: '/system/overview/?',
          to: 'system-overview-units'
        }
      })
    );
  },

  getOrganizationRoutes() {
    // Return filtered Routes
    return this.getFilteredRoutes(
      Hooks.applyFilter('organizationRoutes', {
        routes: [{
          type: Route,
          name: 'system-organization-users',
          path: 'users/?',
          handler: UsersTab,
          children: []
        }],
        redirect: {
          type: Redirect,
          from: '/system/organization/?',
          to: 'system-organization-users'
        }
      })
    );
  },

  getSystemRoutes() {
    let overviewRoute = {
      type: Route,
      name: 'system-overview',
      path: 'overview/?',
      // Get children for Overview
      children: RouteFactory.getOverviewRoutes()
    };

    let organizationRoute = {
      type: Route,
      name: 'system-organization',
      path: 'organization/?',
      // Get children for Overview
      children: RouteFactory.getOrganizationRoutes()
    };

    // Return filtered Routes
    return this.getFilteredRoutes(
      // Pass in Object so Plugins can mutate routes and the default redirect
      Hooks.applyFilter('systemRoutes', {
        routes: [overviewRoute, organizationRoute],
        redirect: {
          type: Redirect,
          from: '/system/?',
          to: 'system-overview'
        }
      })
    );
  },

  getFilteredRoutes(filteredRoutes) {
    // Push redirect onto Routes Array
    return filteredRoutes.routes.concat([filteredRoutes.redirect]);
  },

  getRoutes() {

    let childRoutes = this.getSystemRoutes();

    return {
      type: Route,
      name: 'system',
      path: 'system/?',
      handler: SystemPage,
      children: childRoutes,
      buildBreadCrumb: function () {
        return {
          getCrumbs: function () {
            return [
              {
                label: 'System',
                route: {to: 'system'}
              }
            ]
          }
        }
      }
    };
  }
};

module.exports = RouteFactory;
