import classNames from "classnames";
import React from "react";

const ConfigurationMapLabel = props => {
  const labelClasses = classNames("configuration-map-label", {
    "configuration-map-attribute-label": props.isAttribute
  });

  return (
    <div className={labelClasses}>
      {props.children}
    </div>
  );
};

ConfigurationMapLabel.propTypes = {
  isAttribute: React.PropTypes.bool
};

module.exports = ConfigurationMapLabel;
