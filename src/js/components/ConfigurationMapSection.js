import React from 'react';

const ConfigurationMapSection = (props) => {
  return (
    <div className="configuration-map-section pod flush-top flush-right flush-left">
      {props.children}
    </div>
  );
};

module.exports = ConfigurationMapSection;
