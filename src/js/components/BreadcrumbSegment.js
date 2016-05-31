import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import BreadcrumbLink from './BreadcrumbLink';

class BreadcrumbSegment extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isLoadingCrumb: true
    };

    this.store_listeners = [];
  }

  getCrumbLabel() {
    return '';
  }

  getBackupCrumbLabel() {
    let {parentRouter, routeName} = this.props;
    let route = parentRouter.namedRoutes[routeName];
    let lastParam = route.paramNames[route.paramNames.length - 1];
    let currentParamValue = parentRouter.getCurrentParams()[lastParam];

    return currentParamValue;
  }

  render() {
    let label = '';

    if (this.state.isLoadingCrumb) {
      label = this.getBackupCrumbLabel();
    } else {
      label = this.getCrumbLabel();
    }

    let route = {
      to: this.props.routeName,
      params: this.props.parentRouter.getCurrentParams()
    };

    return (
      <BreadcrumbLink label={label} route={route} />
    );
  }
};

BreadcrumbSegment.propTypes = {
  parentRouter: PropTypes.func.isRequired,
  routeName: PropTypes.string.isRequired
}

module.exports = BreadcrumbSegment;
