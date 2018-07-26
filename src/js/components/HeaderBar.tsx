import * as React from "react";

import { Link } from "react-router";
import { HeaderBar as UIHeaderBar } from "ui-kit-stage/HeaderBar";
import ClusterDropdown from "./ClusterDropdown";
import AccountDropdown from "./AccountDropdown";
import SidebarToggle from "./SidebarToggle";

export default function HeaderBar() {
  // remove this to activate component
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
      <ClusterDropdown />
    </UIHeaderBar>
  );
}
