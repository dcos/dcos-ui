import * as React from "react";
import { HeaderBar as UIHeaderBar } from "ui-kit-stage/HeaderBar";

export default function HeaderBar() {
  // remove this to activate component
  if (arguments) {
    return null;
  }

  return (
    <UIHeaderBar>
      <span>toggle component here</span>
      <span>logo component here</span>
      <span>user-menu component here</span>
      <span>cluster-menu component here</span>
    </UIHeaderBar>
  );
}
