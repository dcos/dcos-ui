import classNames from "classnames";
import React from "react";

import Icon from "./Icon";

const Alert = ({ children, flushBottom, showIcon, type }) => {
  const classes = classNames("alert", {
    [`alert-${type}`]: type != null,
    "flush-bottom": flushBottom === true
  });
  let icon = null;

  if (showIcon) {
    const ids = {
      danger: "yield",
      success: "checkmark"
    };

    icon = <Icon className="alert-icon" id={ids[type]} size="mini" />;
  }

  return (
    <div className={classes}>
      {icon}
      <div className="alert-content">
        {children}
      </div>
    </div>
  );
};

Alert.defaultProps = {
  flushBottom: false,
  showIcon: true,
  type: "danger"
};

Alert.propTypes = {
  children: React.PropTypes.node.isRequired,
  flushBottom: React.PropTypes.bool,
  showIcon: React.PropTypes.bool,
  type: React.PropTypes.oneOf(["danger", "success"])
};

module.exports = Alert;
