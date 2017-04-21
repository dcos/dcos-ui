import React, { PropTypes } from "react";

import ManualBreadcrumbs from "./ManualBreadcrumbs";

class Breadcrumbs extends React.Component {
  buildCrumbs(route) {
    const { params, routes } = this.props;

    const crumbConfiguration = route.buildBreadCrumb(params, routes);
    let crumbs = crumbConfiguration.getCrumbs(params, routes);

    if (crumbConfiguration.parentCrumb) {
      const parentRoute = this.findParentRoute(crumbConfiguration.parentCrumb);

      if (parentRoute && parentRoute.buildBreadCrumb) {
        crumbs = this.buildCrumbs(parentRoute).concat(crumbs);
      }
    }

    return crumbs;
  }

  findParentRoute(parentCrumbPath) {
    const segments = parentCrumbPath.split("/");

    // remove the split('/') artifact - an empty string
    segments.shift(0, 1);

    return this.findRoute(segments, this.getIndexRoute().childRoutes);
  }

  findRoute(segments, routes) {
    if (segments.length === 0) {
      return;
    }

    // Test segments in a greedy way
    // start with a full path and remove one segment per iteration
    for (let j = 0; j < segments.length; j++) {
      let subSegments;
      if (j === 0) {
        subSegments = segments.slice(0);
      } else {
        subSegments = segments.slice(0, -j);
      }

      const subPath = subSegments.join("/");
      const restPath = segments.join("/");

      // Test all routes on that level for each subPath
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const isRedirect = !!route.to;
        const hasChildren = route.childRoutes && route.childRoutes.length > 0;

        if (!isRedirect && subPath === route.path) {
          // Found the match
          if (subPath === restPath) {
            return route;
          }

          // There are children and we still have untested segments
          if (hasChildren) {
            const foundRoute = this.findRoute(
              segments.slice(subSegments.length),
              route.childRoutes
            );

            if (foundRoute) {
              return foundRoute;
            }
          }
        }

        // There're route definitions without a path that are being used for aggregation
        // i.e. nodes/NodesOverview
        if (!route.path && hasChildren) {
          const foundRoute = this.findRoute(segments, route.childRoutes);

          if (foundRoute) {
            return foundRoute;
          }
        }
      }
    }
  }

  getIndexRoute() {
    // In our routing structure the route with id='index' always goes 2
    return this.props.routes[1];
  }

  getCrumbsFromRoute() {
    const { routes } = this.props;
    // Find the first route with a name
    let currentRoute = null;
    loop: for (var i = routes.length - 1; i >= 0; i--) {
      if (routes[i].buildBreadCrumb) {
        currentRoute = routes[i];
        break loop;
      }
    }

    if (!currentRoute) {
      return [];
    }

    const crumbs = this.buildCrumbs(currentRoute);

    return crumbs.slice(this.props.shift);
  }

  render() {
    const crumbs = this.getCrumbsFromRoute();

    return <ManualBreadcrumbs crumbs={crumbs} />;
  }
}

Breadcrumbs.defaultProps = {
  // Remove root '/' by default
  shift: 0,
  routes: []
};

Breadcrumbs.propTypes = {
  breadcrumbClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  // Remove n crumbs from beginning of route crumbs
  shift: PropTypes.number,
  routes: PropTypes.array,
  params: PropTypes.object
};

module.exports = Breadcrumbs;
