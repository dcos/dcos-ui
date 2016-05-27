import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Crumb from './Crumb';

class Breadcrumb extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isLoadingCrumb: true
    };
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
      <Crumb label={label} route={route} />
    );
  }
};

Breadcrumb.propTypes = {
  parentRouter: PropTypes.func.isRequired,
  routeName: PropTypes.string.isRequired
}

module.exports = Breadcrumb;
