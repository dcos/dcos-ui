import React from "react";

const ConfigurationMapLabel = props => {
  let labelClasses;
  if (props.isAttribute) {
    labelClasses = "configuration-map-label configuration-map-attribute-label";
  } else {
    labelClasses = "configuration-map-label";
  }

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
