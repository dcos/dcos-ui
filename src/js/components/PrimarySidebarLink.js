import classNames from "classnames";
import React from "react";
import { Link } from "react-router";

import { Badge } from "@dcos/ui-kit";
import NotificationStore from "../stores/NotificationStore";

const PrimarySidebarLink = ({
  to,
  children,
  hasChildren,
  icon,
  isChildActive,
  isExpanded,
  onClick
}) => {
  const notificationCount = NotificationStore.getNotificationCount(to);

  let sidebarText = <span className="sidebar-menu-item-label">{children}</span>;

  if (notificationCount > 0) {
    sidebarText = (
      <span className="sidebar-menu-item-label badge-container">
        <span className="sidebar-menu-item-label-text badge-container-text">
          {children}
        </span>
        <Badge>{notificationCount}</Badge>
      </span>
    );
  }

  if (hasChildren) {
    const classes = classNames(
      {
        clickable: !isChildActive,
        "is-expanded": isExpanded
      },
      "expandable"
    );

    return (
      <a className={classes} onClick={onClick}>
        {icon}
        {sidebarText}
      </a>
    );
  }

  return (
    <Link to={to}>
      {icon}
      {sidebarText}
    </Link>
  );
};

module.exports = PrimarySidebarLink;
