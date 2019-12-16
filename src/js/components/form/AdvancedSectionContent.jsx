import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

const AdvancedSectionContent = ({ className, children }) => {
  const classes = classNames("advanced-section-content", className);

  return <div className={classes}>{children}</div>;
};

AdvancedSectionContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

export default AdvancedSectionContent;
