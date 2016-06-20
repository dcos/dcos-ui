import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ManualBreadcrumbs from './ManualBreadcrumbs';

class Breadcrumbs extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'history', events: ['change'], listenAlways: true}
    ];
  }

  buildCrumbs(routeName) {
    let {router} = this.context;
    let {namedRoutes} = router;
    let route = namedRoutes[routeName];

    if (!route || !route.buildBreadCrumb) {
      return [];
    }

    let crumbConfiguration = route.buildBreadCrumb(router);
    let crumbs = crumbConfiguration.getCrumbs(router);

    if (crumbConfiguration.parentCrumb) {
      crumbs = this.buildCrumbs(crumbConfiguration.parentCrumb).concat(crumbs);
    }

    return crumbs;
  }

  getCrumbsFromRoute() {
    let {router} = this.context;
    let routes = router.getCurrentRoutes();
    // Find the first route with a name
    let currentRoute = null;
    loop:
    for (var i = routes.length - 1; i >= 0; i--) {
      if (routes[i].name) {
        currentRoute = routes[i];
        break loop;
      }
    }

    if (!currentRoute) {
      return [];
    }

    let crumbs = this.buildCrumbs(currentRoute.name);

    return crumbs.slice(this.props.shift);
  }

  render() {
    let crumbs = this.getCrumbsFromRoute();

    return (
      <ManualBreadcrumbs crumbs={crumbs} />
    );
  }
};

Breadcrumbs.contextTypes = {
  router: PropTypes.func
};

Breadcrumbs.defaultProps = {
  breadcrumbClasses: 'inverse',
  // Remove root '/' by default
  shift: 0
}

Breadcrumbs.propTypes = {
  breadcrumbClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  // Remove n crumbs from beginning of route crumbs
  shift: PropTypes.number
}

module.exports = Breadcrumbs;
