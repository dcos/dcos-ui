import { Dropdown } from "reactjs-components";
import React from "react";

import AuthStore from "#SRC/js/stores/AuthStore";
import AccountDropdownTrigger from "./AccountDropdownTrigger";

class AccountDropdown extends React.Component {
  constructor() {
    super(...arguments);
    this.userLabel = AuthStore.getUserLabel();
  }

  getMenuItems() {
    const menuItems = [
      {
        className: "dropdown-menu-section-header",
        html: <label>{this.userLabel}</label>,
        id: "header-support",
        selectable: false
      },
      {
        html: "Sign Out",
        id: "sign-out",
        onClick: AuthStore.logout
      }
    ];

    return menuItems;
  }

  getTrigger() {
    return <AccountDropdownTrigger content={this.userLabel} />;
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

module.exports = AccountDropdown;
