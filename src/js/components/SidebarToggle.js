import React from "react";

import EventTypes from "../constants/EventTypes";
import Icon from "../components/Icon";
import SidebarActions from "../events/SidebarActions";
import SidebarStore from "../stores/SidebarStore";

var SidebarToggle = React.createClass({
  displayName: "SidebarToggle",

  componentDidMount() {
    SidebarStore.addChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSidebarStateChange
    );
  },

  componentWillUnmount() {
    SidebarStore.removeChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSidebarStateChange
    );
  },

  onSidebarStateChange() {
    this.forceUpdate();
  },

  onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    SidebarActions.toggle();
  },

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
});

module.exports = SidebarToggle;
