import classNames from "classnames";
import React from "react";

const ConfigurationMapValue = props => {
  const classes = classNames("configuration-map-value", {
    "configuration-map-value-stacked": props.stacked
  });

  return (
    <div className={classes}>
      {props.value || props.children}
    </div>
  );
};

module.exports = ConfigurationMapValue;
