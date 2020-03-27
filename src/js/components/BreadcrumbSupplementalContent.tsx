import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";

const BreadcrumbSupplementalContent = (props) => {
  const { children, hasProgressBar } = props;

  if (!children) {
    return null;
  }

  const classes = classNames(
    "breadcrumb__content breadcrumb__content--supplemental",
    { "breadcrumb__content--has-status-bar": hasProgressBar }
  );

  return <div className={classes}>{children}</div>;
};

BreadcrumbSupplementalContent.defaultProps = {
  hasProgressBar: false,
};

BreadcrumbSupplementalContent.propTypes = {
  hasProgressBar: PropTypes.bool,
};

export default BreadcrumbSupplementalContent;
