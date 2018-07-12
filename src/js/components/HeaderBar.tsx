import * as React from "react";

import { HeaderBar as UIHeaderBar } from "ui-kit-stage/HeaderBar";
import ClusterDropdown from "./ClusterDropdown";
import AccountDropdown from "./AccountDropdown";

export default function HeaderBar() {
  // remove this to activate component
  if (arguments) {
    return null;
  }

  return (
    <UIHeaderBar>
      <span>toggle component here</span>
      <div className="header-bar-logo-wrapper">
        <div className="header-bar-logo" />
      </div>
      <AccountDropdown />
      <ClusterDropdown />
    </UIHeaderBar>
  );
}
