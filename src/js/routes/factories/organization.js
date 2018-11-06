/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";

import React from "react";
/* eslint-enable no-unused-vars */
import { Route, Redirect } from "react-router";
import { i18nMark } from "@lingui/react";

import { Hooks } from "PluginSDK";
import OrganizationPage from "../../pages/OrganizationPage";
import UsersPage from "../../pages/system/UsersPage";

const RouteFactory = {
  getOrganizationRoutes() {
    // Return filtered Routes
    return Hooks.applyFilter("organizationRoutes", {
      routes: [
        {
          type: Route,
          path: "users",
          component: UsersPage,
          isInSidebar: true,
          children: []
        }
      ],
      redirect: {
        type: Redirect,
        from: "/organization",
        to: "/organization/users"
      }
    });
  },

  getRoutes() {
    const { routes, redirect } = this.getOrganizationRoutes();

    return [
      // Redirect should always go before path, otherwise router won't ever reach it
      redirect,
      {
        type: Route,
        path: "organization",
        component: OrganizationPage,
        category: i18nMark("system"),
        isInSidebar: true,
        children: routes
      }
    ];
  }
};

module.exports = RouteFactory;
