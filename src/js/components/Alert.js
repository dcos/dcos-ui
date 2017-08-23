/* @flow */
import classNames from "classnames";
import React from "react";

import Icon from "./Icon";

type Props = {
  children: number | string | React.Element | Array<any>,
  flushBottom?: boolean,
  showIcon?: boolean,
  type?: "danger" | "success"
};

const Alert = (props: Props) => {
  const { children, flushBottom, showIcon, type } = props;
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

    icon = (
      <div className="alert-icon">
        <Icon id={ids[type]} size="mini" />
      </div>
    );
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

module.exports = Alert;
