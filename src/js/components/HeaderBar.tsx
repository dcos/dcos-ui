import * as React from "react";

import { Link } from "react-router";
import { HeaderBar as UIHeaderBar } from "ui-kit-stage/HeaderBar";
import ClusterHeader from "./ClusterHeader";
import AccountDropdown from "./AccountDropdown";
import SidebarToggle from "./SidebarToggle";

export default function HeaderBar() {
  return (
    <UIHeaderBar>
      <div className="header-bar-left-align-wrapper">
        <SidebarToggle />
        <Link to="/dashboard" className="header-bar-logo-wrapper">
          <span className="header-bar-logo" />
        </Link>
      </div>
      <div className="header-bar-right-align-wrapper">
        <AccountDropdown />
        <ClusterHeader />
      </div>
    </UIHeaderBar>
  );
}
