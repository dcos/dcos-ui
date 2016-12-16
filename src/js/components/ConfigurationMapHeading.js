import classNames from 'classnames';
import React from 'react';

const ConfigurationMapHeading = (props) => {
  const {children, className, level} = props;

  return React.createElement(
    `h${level}`,
    {
      className: classNames(
        'configuration-map-heading',
        {
          'configuration-map-heading-primary': level === 1
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
