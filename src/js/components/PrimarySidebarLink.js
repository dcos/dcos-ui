import classNames from 'classnames';
import React from 'react';
import {Link} from 'react-router';

import Icon from './Icon';
import NotificationStore from '../stores/NotificationStore';

const PrimarySidebarLink = ({
    to,
    children,
    hasChildren,
    icon,
    isExpanded,
    onClick
  }) => {
  const notificationCount = NotificationStore.getNotificationCount(to);

  let sidebarText = (
    <span className="sidebar-menu-item-label">
      {children}
    </span>
  );

  if (notificationCount > 0) {
    sidebarText = (
      <span className="sidebar-menu-item-label badge-container">
        <span className="sidebar-menu-item-label-text badge-container-text">
          {children}
        </span>
        <span className="badge badge-rounded">{notificationCount}</span>
      </span>
    );
  }

  if (hasChildren) {
    return (
      <a className={classNames({'is-expanded': isExpanded})} onClick={onClick}>
        {icon}{sidebarText}
        <Icon className="sidebar-menu-item-expand-icon"
          family="tiny"
          id="triangle-down"
          size="tiny" />
      </a>
    );
  }

  return <Link to={to}>{icon}{sidebarText}</Link>;
};

module.exports = PrimarySidebarLink;
