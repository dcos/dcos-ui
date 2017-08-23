/* @flow */
import React, { PropTypes } from "react";

import BreadcrumbSegmentLink from "./BreadcrumbSegmentLink";

type Props = {
  params: Object,
  routes: Array<any>,
  routePath: string
};

class BreadcrumbSegment extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      isLoadingCrumb: true
    };
  }



  getCrumbLabel() {
    return "";
  }

  /**
   * This method will be called if `isLoadingCrumb` is true.
   * This will return the very last segment in the URL,
   * using that as a the crumb label
   *
   * @return {String} Crumb label
   */
  getBackupCrumbLabel() {
    const { params, routes, routePath } = this.props;
    const route = routes.find(function(eachRoute) {
      return eachRoute.path === routePath;
    });

    if (!route) {
      return;
    }

    const paramMatch = route.path.match(/:(\w+)/g);

    if (!paramMatch) {
      return;
    }

    let lastParam = paramMatch[paramMatch.length - 1];

    if (lastParam) {
      lastParam = lastParam.substr(1);
      const currentParamValue = params[lastParam];

      return currentParamValue;
    }
  }

  render() {
    let label = "";

    if (this.state.isLoadingCrumb) {
      label = this.getBackupCrumbLabel();
    } else {
      label = this.getCrumbLabel();
    }

    const route = {
      to: this.props.to,
      params: this.props.params
    };

    return <BreadcrumbSegmentLink label={label} route={route} />;
  }
}

module.exports = BreadcrumbSegment;
