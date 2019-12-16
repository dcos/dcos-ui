import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

const Breadcrumb = props => {
  const { children, isCaret, isIcon } = props;

  if (!children) {
    return <noscript />;
  }

  const classes = classNames("breadcrumb", {
    "breadcrumb--is-caret": isCaret,
    "breadcrumb--is-icon": isIcon
  });

  return <div className={classes}>{children}</div>;
};

Breadcrumb.defaultProps = {
  isCaret: false,
  isIcon: false
};

Breadcrumb.propTypes = {
  isCaret: PropTypes.bool,
  isIcon: PropTypes.bool,
  title: PropTypes.string.isRequired
};

export default Breadcrumb;
