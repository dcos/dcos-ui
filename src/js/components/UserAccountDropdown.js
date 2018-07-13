import { Dropdown } from "reactjs-components";
import React from "react";

class UserAccountDropdown extends React.Component {
  getMenuItems() {
    return this.props.menuItems;
  }

  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  render() {
    return (
      <Dropdown
        trigger={this.props.children}
        dropdownMenuClassName="user-account-dropdown-menu dropdown-menu"
        dropdownMenuListClassName="user-account-dropdown-list dropdown-menu-list"
        items={this.getMenuItems()}
        onItemSelection={this.handleItemSelection}
        persistentID="dropdown-trigger"
        transition={true}
      />
    );
  }
}

module.exports = UserAccountDropdown;
