import qs from "query-string";
import { createRoutes } from "react-router";
import * as React from "react";

import Util from "./Util";

function findRedirect(queryString) {
  let redirectTo = false;

  Object.keys(queryString).forEach((key) => {
    if (/redirect/.test(key)) {
      redirectTo = queryString[key];
    }
  });

  return redirectTo;
}

const RouterUtil = {
  /**
   * Parse the url and find the query string (?)
   * before or after the #
   *
   * @param {string} [search=window.location.search] search url param
   * @param {string} [hash=window.location.hash] hash url param
   *
   * @returns {Boolean|Object} false or query string object
   */

  isValidRedirect(url, hostname = window.location.hostname) {
    const parsedUrl = Util.parseUrl(url);

    if (!parsedUrl) {
      return false;
    }

    return parsedUrl.hostname === hostname;
  },

  getQueryStringInUrl(
    search = window.location.search,
    hash = window.location.hash
  ) {
    let queryString = false;
    // This will match url instances like this:
    // /?redirect=SOME_ADDRESS#/login
    if (search) {
      queryString = qs.parse(search);
    }

    // This will match url instances like this:
    // /#/login?redirect=SOME_ADDRESS
    if (!queryString && hash) {
      queryString = qs.parse(hash);
    }

    return queryString;
  },

  /**
   * Find relativePath query
   * and keep it's original encoding
   * the use of qs will decode the path
   * making the path not found
   *
   * @param {string} [url=window.location.href] url to get path from
   *
   * @returns {Boolean|String} False or path encodedURI
   */
  getRelativePath(url = window.location.href) {
    const RELATIVE_PATH = "relativePath=";

    if (!url.includes(RELATIVE_PATH)) {
      return false;
    }

    const startPoint = url.indexOf(RELATIVE_PATH) + RELATIVE_PATH.length;
    const endPoint = url.length;

    return url.substring(startPoint, endPoint);
  },

  getRedirectTo(search, hash) {
    return findRedirect(this.getQueryStringInUrl(search, hash));
  },

  /**
   * Creates a tree of React components for an array of route configurations
   *
   * @param  {Array} routes
   * @return {Array} React tree of routes
   */
  createComponentsFromRoutes(routes) {
    return routes.map((route) => {
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
      .filter((route) => !!route.path)
      .map((route) => route.path)
      .join("/");

    return `/${path}`;
  },

  /**
   * checks if route is a proper filepath route, returns corrected path if not
   *
   * @param {string} routePath - (reconstructed) route path
   * @returns {string} - corrected filePath route path
   */
  getCorrectedFileRoutePath(routePath) {
    return routePath.includes(":filePath")
      ? routePath
      : routePath + (routePath.endsWith("/") ? "" : "/") + ":filePath";
  },

  /**
   * Returns a download path for the resource specified
   *
   * @param  {String} dataType Data Type of the file to download. e.x. text/plain
   * @param {String} filename The filename of the file to download
   * @param {String} data The data included in the file
   * @returns {String} path - The download path, once clicked it will download the file specified
   */
  getResourceDownloadPath(dataType, filename, data) {
    if (dataType && filename && data) {
      return `data:${dataType};content-disposition=attachment;filename=${filename};charset=utf-8,${encodeURIComponent(
        data
      )}`;
    }

    return "";
  },

  /**
   * Trigger a download of a resource for IE
   *
   * @param {String} filename The filename of the file to download
   * @param {String} data The data included in the file
   */
  triggerIEDownload(filename, data) {
    if (window.navigator.msSaveOrOpenBlob) {
      const blob = new Blob([data], { type: "application/json" });
      window.navigator.msSaveOrOpenBlob(blob, filename);
    }
  },
};

export default RouterUtil;
