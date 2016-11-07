import classNames from 'classnames';
import React from 'react';

const ConfigurationMapHeading = (props) => {
  let {children, className, level} = props;

  return React.createElement(
    `h${level}`,
    {
      className: classNames(
        'configuration-map-heading short-bottom',
        {
          'configuration-map-heading-primary': level === 1,
          'short-top': level === 2
        },
        className
      )
    },
    children
  );
};

ConfigurationMapHeading.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  level: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

module.exports = ConfigurationMapHeading;
