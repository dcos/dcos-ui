import classNames from "classnames";
import React from "react";

const Alert = ({ children, flushBottom, type }) => {
  const classes = classNames("message", {
    [`message-${type}`]: type != null,
    "flush-bottom": flushBottom === true
  });

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

Alert.defaultProps = {
  flushBottom: false,
  type: "danger"
};

Alert.propTypes = {
  children: React.PropTypes.node.isRequired,
  flushBottom: React.PropTypes.bool,
  type: React.PropTypes.oneOf(["danger", "success"])
};

module.exports = Alert;
