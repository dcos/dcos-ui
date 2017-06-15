import classNames from "classnames/dedupe";
import React from "react";

import Icon from "../Icon";

function getStateIndicator(isExpanded) {
  let iconID = "triangle-right";

  if (isExpanded) {
    iconID = "triangle-down";
  }

  return <Icon id={iconID} color="purple" family="tiny" size="tiny" />;
}

const AdvancedSectionLabel = ({ className, children, isExpanded, onClick }) => {
  const classes = classNames(
    "advanced-section-label clickable button button-primary-link button-flush",
    className
  );

  return (
    <a className={classes} onClick={onClick}>
      {getStateIndicator(isExpanded)}
      {children}
    </a>
  );
};

AdvancedSectionLabel.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  isExpanded: React.PropTypes.bool,
  onClick: React.PropTypes.func
};

module.exports = AdvancedSectionLabel;
