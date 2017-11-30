import { Dropdown } from "reactjs-components";
import React from "react";
import UserAccountDropdownTrigger from "./UserAccountDropdownTrigger";

class UserAccountDropdown extends React.Component {
  getMenuItems() {
    return [this.props.menuItems];
  }

  getTrigger() {
    const { trigger, clusterName } = this.props;

    if (!trigger) {
      return <UserAccountDropdownTrigger primaryContent={clusterName} />;
    }

    return trigger;
  }

  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  render() {
    return (
      <Dropdown
        trigger={this.getTrigger()}
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
