import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

class BreadcrumbSupplementalContent extends React.Component {
  render() {
    const { children, hasProgressBar } = this.props;

    if (!children) {
      return null;
    }

    const classes = classNames(
      "breadcrumb__content breadcrumb__content--supplemental",
      { "breadcrumb__content--has-status-bar": hasProgressBar }
    );

    return <div className={classes}>{children}</div>;
  }
}

BreadcrumbSupplementalContent.defaultProps = {
  hasProgressBar: false
};

BreadcrumbSupplementalContent.propTypes = {
  hasProgressBar: PropTypes.bool
};

module.exports = BreadcrumbSupplementalContent;
