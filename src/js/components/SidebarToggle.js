import React from "react";

import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import SidebarActions from "../events/SidebarActions";

export default class SidebarToggle extends React.Component {
  onClick() {
    SidebarActions.toggle();
  }

  render() {
    return (
      <span className="header-bar-sidebar-toggle" onClick={this.onClick}>
        <Icon shape={SystemIcons.Menu} size={iconSizeXs} color="currentColor" />
      </span>
    );
  }
}
