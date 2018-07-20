import { Dropdown } from "reactjs-components";
import React from "react";

const ClusterDropdownTrigger = ({ onTrigger, children }) => {
  return (
    <span className="header-bar-dropdown-trigger" onClick={onTrigger}>
      <span className="header-bar-dropdown-trigger-content text-overflow">
        {children}
      </span>
    </span>
  );
};

class ClusterDropdown extends React.Component {
  getMenuItems() {
    return this.props.menuItems;
  }

  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  render() {
    const { clusterName } = this.props;

    return (
      <Dropdown
        anchorRight={true}
        trigger={<ClusterDropdownTrigger>{clusterName}</ClusterDropdownTrigger>}
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

module.exports = ClusterDropdown;
