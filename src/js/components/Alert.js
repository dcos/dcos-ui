import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

import Icon from "./Icon";

const Alert = ({ children, flushBottom, showIcon, type }) => {
  const classes = classNames("message", {
    [`message-${type}`]: type != null,
    "flush-bottom": flushBottom === true
  });
  let icon = null;

  if (showIcon) {
    const ids = {
      danger: "yield",
      success: "checkmark"
    };

    icon = (
      <div className="message-icon">
        <Icon id={ids[type]} size="mini" />
      </div>
    );
  }

  return (
    <div className={classes}>
      {icon}
      <div className="message-content message-type-style">{children}</div>
    </div>
  );
};

Alert.defaultProps = {
  flushBottom: false,
  showIcon: true,
  type: "danger"
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  flushBottom: PropTypes.bool,
  showIcon: PropTypes.bool,
  type: PropTypes.oneOf(["danger", "success"])
};

module.exports = Alert;
