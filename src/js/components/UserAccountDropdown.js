import {Dropdown} from 'reactjs-components';
import React from 'react';

class UserAccountDropdown extends React.Component {
  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  render() {
    return (
      <Dropdown buttonClassName="user-account-dropdown-button"
        dropdownMenuClassName="user-account-dropdown-menu dropdown-menu"
        dropdownMenuListClassName="user-account-dropdown-list dropdown-menu-list"
        items={this.props.menuItems}
        onItemSelection={this.handleItemSelection}
        persistentID="dropdown-trigger"
        transition={true}
        wrapperClassName="user-account-dropdown dropdown header flex-item-shrink-0" />
    );
  }
};

module.exports = UserAccountDropdown;
