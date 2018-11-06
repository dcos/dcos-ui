import { Trans } from "@lingui/macro";
import classNames from "classnames";
import React from "react";
import { Link } from "react-router";

import { Badge } from "@dcos/ui-kit";
import NotificationStore from "../stores/NotificationStore";

const PrimarySidebarLink = ({
  to,
  label,
  hasChildren,
  icon,
  isChildActive,
  isExpanded,
  onClick
}) => {
  const notificationCount = NotificationStore.getNotificationCount(to);

  let sidebarText = (
    <Trans render="span" className="sidebar-menu-item-label" id={label} />
  );

  if (notificationCount > 0) {
    sidebarText = (
      <span className="sidebar-menu-item-label badge-container">
        <Trans
          render="span"
          className="sidebar-menu-item-label-text badge-container-text"
          id={label}
        />
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
