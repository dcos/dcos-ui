import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "reactjs-components";

class UserAccountDropdown extends React.Component {
  getTrigger() {
    return this.props.trigger;
  }

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
        trigger={this.getTrigger()}
        dropdownMenuClassName="user-account-dropdown-menu dropdown-menu header-bar-dropdown-menu"
        dropdownMenuListClassName="user-account-dropdown-list dropdown-menu-list"
        items={this.getMenuItems()}
        onItemSelection={this.handleItemSelection}
        persistentID="dropdown-trigger"
        transition={true}
      />
    );
  }
}

UserAccountDropdown.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.object),
  trigger: PropTypes.node
};

module.exports = UserAccountDropdown;
