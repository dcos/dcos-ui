import React from 'react';
import {Link} from 'react-router';
import NotificationStore from '../stores/NotificationStore';

export default ({path, label, icon}) => {
  const notificationCount = NotificationStore.getNotificationCount(path);

  let sidebarText = (
    <span className="sidebar-menu-item-label">
      {label}
    </span>
  );

  if (notificationCount > 0) {
    sidebarText = (
      <span className="sidebar-menu-item-label badge-container">
        <span className="sidebar-menu-item-label-text badge-container-text">
          {label}
        </span>
        <span className="badge">{notificationCount}</span>
      </span>
    );
  }

  return <Link to={path}>{icon}{sidebarText}</Link>;
};
