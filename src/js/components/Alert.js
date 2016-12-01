import classNames from 'classnames';
import React from 'react';

import Icon from './Icon';

const Alert = ({children, showIcon, type}) => {
  const classes = classNames('alert', {
    [`alert-${type}`]: type != null
  });
  let icon = null;

  if (showIcon) {
    const ids = {
      danger: 'ring-exclamation',
      success: 'checkmark'
    };

    icon = (
      <Icon className="yield" family="system" id={ids[type]} size="mini" />
    );
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
