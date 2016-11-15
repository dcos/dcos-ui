import React, {PropTypes} from 'react';
import {Redirect} from 'react-router';

import ManualBreadcrumbs from './ManualBreadcrumbs';

class Breadcrumbs extends React.Component {
  buildCrumbs(route) {
    let {params, routes} = this.props;

    let crumbConfiguration = route.buildBreadCrumb(params, routes);
    let crumbs = crumbConfiguration.getCrumbs(params, routes);

    if (crumbConfiguration.parentCrumb) {
      let parentRoute = this.findParentRoute(crumbConfiguration.parentCrumb);

      if (parentRoute && parentRoute.buildBreadCrumb) {
        crumbs = this.buildCrumbs(parentRoute).concat(crumbs);
      }
    }

    return crumbs;
  }

  findParentRoute(parentCrumbPath) {
    let segments = parentCrumbPath.split('/');

    // remove the split('/') artifact - an empty string
    segments.shift(0, 1);

    return this.findRoute(segments, this.getIndexRoute().childRoutes);
  }

  findRoute(segments, routes) {
    const segment = segments[0];

    // Nothing to match
    if (!segment) {
      return null;
    }

    for (var i = 0; i < routes.length; i++) {
      const route = routes[i];

      const isRedirect = route.component === Redirect;
      const matchesPath = route.path && route.path.startsWith(segment);
      const hasPath = !!route.path;
      const hasChildren = route.childRoutes && route.childRoutes.length > 0;

      if (!isRedirect && matchesPath) {
        // Can't go deeper, return current route
        if (segments.length === 1) {
          return route;
        }

        // There are children and we still have untested segments
        if (hasChildren) {
          let foundRoute = this.findRoute(segments.slice(1), route.childRoutes);

          if (foundRoute) {
            return foundRoute;
          }
        }

        // No children, still have segments.
        // Meaning a route declared something like task/:taskID to be it's path
        // So we need to concatinate two first segments and try again this set of routes
        // We will be growing the segment until we exhaust all segments
        if (segments.length > 1) {
          const newSegment = `${segments[0]}/${segments[1]}`;
          const newSegments = [newSegment].concat(segments.slice(2));

          return this.findRoute(newSegments, routes);
        }

        return route;
      }

      // There're route definitions without a path that are being used for aggregation
      // i.e. nodes/NodesOverview
      if (!hasPath && hasChildren) {
        let foundRoute = this.findRoute(segments, route.childRoutes);

        if (foundRoute) {
          return foundRoute;
        }
      }
    }

    return null;
  }

  getIndexRoute() {
    // In our routing structure the route with id='index' always goes 2
    return this.props.routes[1];
  }

  getCrumbsFromRoute() {
    let {routes} = this.props;
    // Find the first route with a name
    let currentRoute = null;
    loop:
    for (var i = routes.length - 1; i >= 0; i--) {
      if (routes[i].buildBreadCrumb) {
        currentRoute = routes[i];
        break loop;
      }
    }

    if (!currentRoute) {
      return [];
    }

    let crumbs = this.buildCrumbs(currentRoute);

    return crumbs.slice(this.props.shift);
  }

  render() {
    let crumbs = this.getCrumbsFromRoute();

    return (
      <ManualBreadcrumbs crumbs={crumbs} />
    );
  }
};

Breadcrumbs.defaultProps = {
  // Remove root '/' by default
  shift: 0
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
