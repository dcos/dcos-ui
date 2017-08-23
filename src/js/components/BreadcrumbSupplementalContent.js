/* @flow */
import classNames from "classnames";
import React from "react";

type Props = { hasStatusBar?: boolean };

class BreadcrumbSupplementalContent extends React.Component {

  render() {
    const { children, hasStatusBar } = this.props;

    if (!children) {
      return null;
    }

    const classes = classNames(
      "breadcrumb__content breadcrumb__content--supplemental",
      { "breadcrumb__content--has-status-bar": hasStatusBar }
    );

    return (
      <div className={classes}>
        {children}
      </div>
    );
  }
}

BreadcrumbSupplementalContent.defaultProps = {
  hasStatusBar: false
};

module.exports = BreadcrumbSupplementalContent;
