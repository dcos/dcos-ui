import classNames from "classnames/dedupe";
import React from "react";

const AdvancedSectionContent = ({ className, children }) => {
  const classes = classNames("advanced-section-content", className);

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

AdvancedSectionContent.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = AdvancedSectionContent;
