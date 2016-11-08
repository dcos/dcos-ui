import classNames from 'classnames';
import React from 'react';

import Icon from './Icon';

const Alert = ({children, showIcon, type}) => {
  const classes = classNames('alert', {
    [`alert-${type}`]: type != null
  });
  let icon = null;

  if (showIcon) {
    const className = 'alert-icon';
    const family = 'mini';
    const size = 'mini';

    switch (type) {
      case 'danger':
        icon = (
          <Icon className={className}
            family={family}
            id="ring-exclamation"
            size={size} />
          );
        break;
      case 'successs':
        icon = (
          <Icon className={className}
            family={family}
            id="checkmark"
            size={size} />
          );
        break;
    }
  }

  return (
    <div className={classes}>
      {icon}
      <div className="alert-content">
        {children}
      </div>
    </div>
  );
};

Alert.defaultProps = {
  showIcon: true,
  type: 'danger'
};

Alert.propTypes = {
  children: React.PropTypes.node.isRequired,
  showIcon: React.PropTypes.bool,
  type: React.PropTypes.oneOf(['danger', 'success'])
};

module.exports = Alert;
