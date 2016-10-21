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
    return Hooks.applyFilter('organizationRoutes', {
      routes: [{
        type: Route,
        path: 'users',
        component: UsersTab,
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
    });
  },

  getRoutes() {
    let {routes, redirect} = this.getOrganizationRoutes();

    return [
      // Redirect should always go before path, otherwise router won't ever reach it
      redirect,
      {
        type: Route,
        path: 'organization',
        component: OrganizationPage,
        category: 'system',
        isInSidebar: true,
        children: routes,
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
      }
    ];
  }
};

module.exports = RouteFactory;
