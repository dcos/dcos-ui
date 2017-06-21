import { Dropdown } from "reactjs-components";
import React from "react";

import UserAccountDropdownTrigger from "./UserAccountDropdownTrigger";

class UserAccountDropdown extends React.Component {
  getMenuItems() {
    return [
      {
        className: "hidden",
        html: (
          <UserAccountDropdownTrigger primaryContent={this.props.clusterName} />
        ),
        id: "dropdown-trigger",
        selectable: false
      }
    ].concat(this.props.menuItems);
  }

  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  render() {
    return (
      <Dropdown
        buttonClassName="user-account-dropdown-button text-no-transform"
        dropdownMenuClassName="user-account-dropdown-menu dropdown-menu"
        dropdownMenuListClassName="user-account-dropdown-list dropdown-menu-list"
        items={this.getMenuItems()}
        onItemSelection={this.handleItemSelection}
        persistentID="dropdown-trigger"
        transition={true}
        wrapperClassName="user-account-dropdown dropdown header flex-item-shrink-0"
      />
    );
  }
}

module.exports = UserAccountDropdown;
