import React from "react";
import classNames from "classnames";

const ConfigurationMapAction = ({ isHover, onClick, children }) => {
  const classes = classNames("button button-link flush", {
    "table-display-on-row-hover": isHover
  });

  return (
    <a className={classes} onClick={onClick}>
      {children}
    </a>
  );
};

ConfigurationMapAction.propTypes = {
  onClick: React.PropTypes.func,
  isHover: React.PropTypes.bool
};

module.exports = ConfigurationMapAction;
