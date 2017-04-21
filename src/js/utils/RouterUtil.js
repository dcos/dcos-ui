import qs from "query-string";
import { createRoutes } from "react-router";
import React from "react";

import Util from "./Util";

function findRedirect(queryString) {
  let redirectTo = false;

  Object.keys(queryString).forEach(function(key) {
    if (/redirect/.test(key)) {
      redirectTo = queryString[key];
    }
  });

  return redirectTo;
}

const RouterUtil = {
  getRedirectTo() {
    let redirectTo = false;

    // This will match url instances like this:
    // /?redirect=SOME_ADDRESS#/login
    if (global.location.search) {
      redirectTo = findRedirect(qs.parse(global.location.search));
    }

    // This will match url instances like this:
    // /#/login?redirect=SOME_ADDRESS
    if (!redirectTo && global.location.hash) {
      redirectTo = findRedirect(qs.parse(global.location.hash));
    }

    return redirectTo;
  },

  /**
   * Creates a tree of React components for an array of route configurations
   *
   * @param  {Array} routes
   * @return {Array} React tree of routes
   */
  createComponentsFromRoutes(routes) {
    return routes.map(function(route) {
      let args = [route.type, Util.omit(route, ["type", "children"])];

      if (
        route.component &&
        route.component.willTransitionTo &&
        !route.onEnter
      ) {
        route.onEnter = route.component.willTransitionTo;
      }

      if (route.children) {
        const children = RouterUtil.createComponentsFromRoutes(route.children);
        args = args.concat(children);
      }

      return React.createElement(...args);
    });
  },

  /**
   * Builds a route array that react router can use,
   * with the correct configuration.
   *
   * @param  {Array} originalRoutes Original Route configuration
   * @return {Array} Routes ready to use by react router
   */
  buildRoutes(originalRoutes) {
    const elementRoutes = RouterUtil.createComponentsFromRoutes(originalRoutes);

    return createRoutes(elementRoutes);
  },

  /**
   * Checks if a page should hide the header navigation tabs
   * @param  {Array} routes instance of react-router
   * @return {Bool} should hide Page Navigation
   */
  shouldHideNavigation(routes) {
    return !!routes[routes.length - 1].hideHeaderNavigation;
  },

  /**
   * Builds absolute path from routes array
   * React router v2.8.1 provides routes prop to a component that bound to a <Route />
   * this.props.routes contains a plain list of all routes React router hits.
   * So for for /foo/:id with the following set of routes
   * <Route path="foo">
   *   <Route path=":id">
   *     <IndexRoute />
   *     ...
   *   </Route>
   * </Route>
   * React router will provide the following array
   * [
   *   {type: Route, path: 'foo'},
   *   {type: Route, path: ':id'},
   *   {type: IndexRoute}
   * ]
   * so we should filter all the routes that have `path` and join them to get the absolute path pattern
   * @param {Array} routes - an array of current routes react-router gives you
   * @returns {String} path - absolute path pattern
   */
  reconstructPathFromRoutes(routes) {
    const path = routes
      .filter(function(route) {
        return !!route.path;
      })
      .map(function(route) {
        return route.path;
      })
      .join("/");

    return `/${path}`;
  }
};

module.exports = RouterUtil;
