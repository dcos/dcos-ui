import React from "react";

import Icon from "../components/Icon";
import SidebarActions from "../events/SidebarActions";

export default class SidebarToggle extends React.Component {
  onClick() {
    SidebarActions.toggle();
  }

  render() {
    return (
      <div className="page-header-sidebar-toggle" onClick={this.onClick}>
        <Icon
          className="page-header-sidebar-toggle-icon"
          id="menu"
          size="mini"
          color="grey"
        />
        <span className="page-header-sidebar-toggle-label">
          Show/Hide Sidebar
        </span>
      </div>
    );
  }
}
