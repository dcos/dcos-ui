import classNames from "classnames";
import React from "react";

const ConfigurationMapLabel = props => {
  const labelClasses = classNames("configuration-map-label", {
    "configuration-map-label-no-text-transform": props.keepTextCase
  });

  return (
    <div className={labelClasses}>
      {props.children}
    </div>
  );
};

ConfigurationMapLabel.propTypes = {
  keepTextCase: React.PropTypes.bool
};

module.exports = ConfigurationMapLabel;
