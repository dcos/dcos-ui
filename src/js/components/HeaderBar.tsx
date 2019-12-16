import * as React from "react";
import { Link } from "react-router";
import { MountService } from "foundation-ui";

import ClusterHeader from "./ClusterHeader";
import SidebarToggle from "./SidebarToggle";

export default class HeaderBar extends React.Component {
  public render() {
    return (
      <div className="header-bar">
        <div className="header-bar-left-align-wrapper">
          <SidebarToggle />
          <Link to="/dashboard" className="header-bar-logo-wrapper">
            <span className="header-bar-logo" />
          </Link>
        </div>
        <div className="header-bar-right-align-wrapper">
          <MountService.Mount type="Header:UserAccountDropdown" />;
          <ClusterHeader />
        </div>
      </div>
    );
  }
}
