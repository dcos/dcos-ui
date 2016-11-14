import React, {PropTypes} from 'react';

import ManualBreadcrumbs from './ManualBreadcrumbs';

class Breadcrumbs extends React.Component {
  buildCrumbs(route) {
    let {params, routes} = this.props;

    let crumbConfiguration = route.buildBreadCrumb(params, routes);
    let crumbs = crumbConfiguration.getCrumbs(params, routes);

    if (crumbConfiguration.parentCrumb) {
      let parentCrumb = routes.find(function (eachRoute) {
        return eachRoute.path === crumbConfiguration.parentCrumb;
      });
      if (parentCrumb && parentCrumb.buildBreadCrumb) {
        crumbs = this.buildCrumbs(parentCrumb).concat(crumbs);
      }
    }

    return crumbs;
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
