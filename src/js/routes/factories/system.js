/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {Route, Redirect} from 'react-router';

import {Hooks} from 'PluginSDK';
import OverviewDetailTab from '../../pages/system/OverviewDetailTab';
import RepositoriesTab from '../../pages/system/RepositoriesTab';
import SystemPage from '../../pages/SystemPage';
import UnitsHealthDetail from '../../pages/system/UnitsHealthDetail';
import UnitsHealthNodeDetail from '../../pages/system/UnitsHealthNodeDetail';
import UnitsHealthDetailBreadcrumb from '../../pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb';
import UnitsHealthNodeDetailBreadcrumb from '../../pages/system/breadcrumbs/UnitsHealthNodeDetailBreadcrumb';
import UnitsHealthTab from '../../pages/system/UnitsHealthTab';

let RouteFactory = {

  getOverviewRoutes() {
    // Return filtered Routes
    return this.getFilteredRoutes(
      Hooks.applyFilter('OverviewRoutes', {
        routes: [
          {
            type: Route,
            name: 'system-overview-details',
            path: 'details/?',
            handler: OverviewDetailTab
          },
          {
            type: Route,
            name: 'system-overview-units',
            path: 'components/?',
            handler: UnitsHealthTab,
            buildBreadCrumb() {
              return {
                getCrumbs() {
                  return [
                    {
                      label: 'System Components',
                      route: {to: 'system-overview-units'}
                    }
                  ];
                }
              };
            }
          },
          {
            type: Route,
            name: 'system-overview-units-unit-nodes-detail',
            path: 'components/:unitID/?',
            handler: UnitsHealthDetail,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: 'system-overview-units',
                getCrumbs(router) {
                  return [
                    <UnitsHealthDetailBreadcrumb
                      parentRouter={router}
                      routeName="system-overview-units-unit-nodes-detail" />
                  ];
                }
              };
            }
          },
          {
            type: Route,
            name: 'system-overview-units-unit-nodes-node-detail',
            path: 'components/:unitID/nodes/:unitNodeID/?',
            handler: UnitsHealthNodeDetail,
            hideHeaderNavigation: true,
            buildBreadCrumb() {
              return {
                parentCrumb: 'system-overview-units-unit-nodes-detail',
                getCrumbs(router) {
                  return [
                    <UnitsHealthNodeDetailBreadcrumb
                      parentRouter={router}
                      routeName="system-overview-units-unit-nodes-node-detail"
                      />
                  ];
                }
              };
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
          to: 'system-overview-details'
        }
      })
    );
  },

  getOrganizationRoutes() {
    // Return filtered Routes
    return this.getFilteredRoutes(
      Hooks.applyFilter('organizationRoutes')
    );
  },

  getSystemRoutes() {
    let routes = [{
      type: Route,
      name: 'system-overview',
      path: 'overview/?',
      // Get children for Overview
      children: RouteFactory.getOverviewRoutes()
    }];

    let organizationChildren = RouteFactory.getOrganizationRoutes();
    if (organizationChildren) {
      routes.push({
        type: Route,
        name: 'system-organization',
        path: 'organization/?',
        buildBreadCrumb() {
          return {
            getCrumbs() {
              return [
                {
                  label: 'Organization',
                  route: {to: 'system-organization'}
                }
              ];
            }
          };
        },
        // Get children for Overview
        children: organizationChildren
      });
    }

    // Return filtered Routes
    return this.getFilteredRoutes(
      // Pass in Object so Plugins can mutate routes and the default redirect
      Hooks.applyFilter('systemRoutes', {
        routes,
        redirect: {
          type: Redirect,
          from: '/system/?',
          to: 'system-overview'
        }
      })
    );
  },

  getFilteredRoutes(filteredRoutes) {
    if (!filteredRoutes) {
      return;
    }

    // Push redirect onto Routes Array
    return filteredRoutes.routes.concat([filteredRoutes.redirect]);
  },

  getRoutes() {
    let children = this.getSystemRoutes();

    return {
      type: Route,
      name: 'system',
      path: 'system/?',
      handler: SystemPage,
      children,
      buildBreadCrumb() {
        return {
          getCrumbs() {
            return [
              {
                label: 'System',
                route: {to: 'system'}
              }
            ];
          }
        };
      }
    };
  }
};

module.exports = RouteFactory;
