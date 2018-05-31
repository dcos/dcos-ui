import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

const ConfigurationMapLabel = props => {
  const labelClasses = classNames("configuration-map-label", {
    "configuration-map-label-no-text-transform": props.keepTextCase
  });

  return <div className={labelClasses}>{props.children}</div>;
};

ConfigurationMapLabel.propTypes = {
  keepTextCase: PropTypes.bool
};

module.exports = ConfigurationMapLabel;
