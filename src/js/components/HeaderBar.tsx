import * as React from "react";

import { HeaderBar as UIHeaderBar } from "ui-kit-stage/HeaderBar";
import ClusterDropdown from "./ClusterDropdown";
import AccountDropdown from "./AccountDropdown";
import { Link } from "react-router";

export default function HeaderBar() {
  // remove this to activate component
  if (arguments) {
    return null;
  }

  return (
    <UIHeaderBar>
      <span>toggle component here</span>
      <Link to="/dashboard" className="header-bar-logo-wrapper">
        <span className="header-bar-logo" />
      </Link>
      <AccountDropdown />
      <ClusterDropdown />
    </UIHeaderBar>
  );
}
