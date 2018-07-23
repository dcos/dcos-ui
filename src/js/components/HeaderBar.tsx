import * as React from "react";

import { Link } from "react-router";

import ClusterHeader from "./ClusterHeader";
import AccountDropdown from "./AccountDropdown";
import SidebarToggle from "./SidebarToggle";

export class HeaderBar extends React.Component {
  render() {
    return (
      <div className="header-bar">
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
      </div>
    );
  }
}
