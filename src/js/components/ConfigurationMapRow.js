import React from "react";

const ConfigurationMapRow = props => {
  return (
    <div className="configuration-map-row table-row">
      {props.children}
    </div>
  );
};

module.exports = ConfigurationMapRow;
