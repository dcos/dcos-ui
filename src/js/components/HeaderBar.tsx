import * as React from "react";

import { Link } from "react-router";
import { HeaderBar as UIHeaderBar } from "ui-kit-stage/HeaderBar";
import ClusterHeader from "./ClusterHeader";
import AccountDropdown from "./AccountDropdown";
import SidebarToggle from "./SidebarToggle";

export default function HeaderBar() {
  // remove this to activate component
  // when enabled, remove skip from Sidebar-cy.js
  if (arguments) {
    return null;
  }

  return (
    <UIHeaderBar>
      <SidebarToggle />
      <Link to="/dashboard" className="header-bar-logo-wrapper">
        <span className="header-bar-logo" />
      </Link>
      <AccountDropdown />
      <ClusterHeader />
    </UIHeaderBar>
  );
}
