import React from "react";

import Icon from "../components/Icon";
import SidebarActions from "../events/SidebarActions";

export default class SidebarToggle extends React.Component {
  onClick() {
    SidebarActions.toggle();
  }

  render() {
    return (
      <span className="header-bar-sidebar-toggle" onClick={this.onClick}>
        <Icon id="menu" size="mini" />
      </span>
    );
  }
}
