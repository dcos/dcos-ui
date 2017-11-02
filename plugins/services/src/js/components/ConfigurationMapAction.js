import React from "react";
import classNames from "classnames";

const ConfigurationMapAction = ({ isHover, onClick, href, children }) => {
  const classes = classNames("button button-link flush", {
    "table-display-on-row-hover": isHover
  });

  if (href) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
};

ConfigurationMapAction.propTypes = {
  onClick: React.PropTypes.func,
  href: React.PropTypes.string,
  isHover: React.PropTypes.bool
};

module.exports = ConfigurationMapAction;
