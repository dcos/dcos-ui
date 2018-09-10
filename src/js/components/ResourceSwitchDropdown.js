import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
import ResourcesUtil from "#SRC/js/utils/ResourcesUtil";

const ResourceSwitchDropdownTrigger = ({ onTrigger, children }) => {
  return (
    <span className="resource-switch-trigger" onClick={onTrigger}>
      {children}
    </span>
  );
};

export default class ResourceSwitchDropdown extends React.Component {
  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  getMenuItems() {
    const resourceLabels = ResourcesUtil.getResourceLabels();
    const menuItems = ResourcesUtil.getDefaultResources().map(resource => {
      const label = resourceLabels[resource];
      let html = <span>{label}</span>;

      if (this.props.selectedResource === resource) {
        html = (
          <span className="selected">
            <Icon color="purple" id="check" size="mini" />
            {label}
          </span>
        );
      }

      return {
        html,
        id: resource,
        onClick: this.props.onResourceSelectionChange.bind(null, resource)
      };
    });

    return menuItems;
  }

  getTrigger() {
    const { selectedResource } = this.props;

    const resourceLabels = ResourcesUtil.getResourceLabels();
    const content = resourceLabels[selectedResource];

    return (
      <ResourceSwitchDropdownTrigger>{content}</ResourceSwitchDropdownTrigger>
    );
  }

  render() {
    return (
      <Dropdown
        anchorRight={true}
        dropdownMenuClassName="dropdown-menu resource-switch-dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list resource-switch-dropdown-menu-list"
        items={this.getMenuItems()}
        onItemSelection={this.handleItemSelection}
        initialID={this.props.selectedResource}
        transition={true}
        trigger={this.getTrigger()}
      />
    );
  }
}

ResourceSwitchDropdown.propTypes = {
  selectedResource: PropTypes.string.isRequired,
  onResourceSelectionChange: PropTypes.func.isRequired
};
