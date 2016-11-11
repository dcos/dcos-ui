import React from 'react';
import {Link} from 'react-router';
import NotificationStore from '../stores/NotificationStore';

const PrimarySidebarLink = ({to, children, icon}) => {
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
        <span className="badge">{notificationCount}</span>
      </span>
    );
  }

  return <Link to={to}>{icon}{sidebarText}</Link>;
};

module.exports = PrimarySidebarLink;
