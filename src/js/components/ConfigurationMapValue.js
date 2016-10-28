import classNames from 'classnames';
import React from 'react';

const ConfigurationMapValue = (props) => {
  let classes = classNames('configuration-map-value', {
    'configuration-map-value-stacked': props.stacked
  });

  return (
    <div className={classes}>
      {props.children}
    </div>
  );
};

module.exports = ConfigurationMapValue;
