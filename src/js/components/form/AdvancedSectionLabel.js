import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
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
      <span>{children}</span>
    </a>
  );
};

AdvancedSectionLabel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  isExpanded: PropTypes.bool,
  onClick: PropTypes.func
};

module.exports = AdvancedSectionLabel;
