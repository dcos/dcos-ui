import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

const FullScreenModalHeaderSubTitle = props => {
  const { children, className } = props;
  const classes = classNames("small", className);

  return <div className={classes}>{children}</div>;
};

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

FullScreenModalHeaderSubTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: classProps
};

export default FullScreenModalHeaderSubTitle;
