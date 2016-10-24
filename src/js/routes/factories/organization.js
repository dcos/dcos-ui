/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {Route, Redirect} from 'react-router';

import {Hooks} from 'PluginSDK';
import OrganizationPage from '../../pages/OrganizationPage';
import UsersTab from '../../pages/system/UsersTab';

let RouteFactory = {
  getOrganizationRoutes() {
    // Return filtered Routes
    return this.getFilteredRoutes(
      Hooks.applyFilter('organizationRoutes', {
        routes: [{
          type: Route,
          path: 'users',
          handler: UsersTab,
          isInSidebar: true,
          buildBreadCrumb() {
            return {
              parentCrumb: '/organization',
              getCrumbs() {
                return [
                  {
                    label: 'Users',
                    route: {to: '/organization/users'}
                  }
                ];
              }
            };
          },
          children: []
        }],
        redirect: {
          type: Redirect,
          from: '/organization',
          to: '/organization/users'
        }
      })
    );
  },

  getFilteredRoutes(filteredRoutes) {
    // Push redirect onto Routes Array
    return filteredRoutes.routes.concat([filteredRoutes.redirect]);
  },

  getRoutes() {
    let children = this.getOrganizationRoutes();

    return {
      type: Route,
      path: 'organization',
      handler: OrganizationPage,
      category: 'system',
      isInSidebar: true,
      children,
      buildBreadCrumb() {
        return {
          getCrumbs() {
            return [
              {
                label: 'Organization',
                route: {to: '/organization'}
              }
            ];
          }
        };
      }
    };
  }
};

module.exports = RouteFactory;
