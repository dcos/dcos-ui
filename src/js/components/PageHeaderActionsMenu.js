import { Dropdown } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";

import Icon from "./Icon";

const getMenuItems = (children, iconID) => {
  return [
    {
      className: "hidden",
      html: <Icon id={iconID} size="mini" />,
      id: "trigger"
    },
    ...React.Children.map(children, getDropdownItemFromComponent)
  ];
};

const handleItemSelection = item => {
  if (item.onItemSelect) {
    item.onItemSelect();
  }
};

const getDropdownItemFromComponent = (child, index) => {
  return {
    onItemSelect: child.props.onItemSelect,
    html: child,
    id: index
  };
};

const PageHeaderActionsMenu = ({
  anchorRight,
  children,
  iconID,
  disabledActions
}) => {
  return (
    <Dropdown
      anchorRight={anchorRight}
      buttonClassName="button button-primary-link button-narrow"
      items={getMenuItems(children, iconID)}
      onItemSelection={handleItemSelection}
      persistentID="trigger"
      transition={true}
      dropdownMenuClassName="dropdown-menu"
      dropdownMenuListClassName="dropdown-menu-list"
      wrapperClassName="dropdown"
      disabled={disabledActions}
    />
  );
};

PageHeaderActionsMenu.defaultProps = {
  anchorRight: true,
  iconID: "ellipsis-vertical"
};

PageHeaderActionsMenu.propTypes = {
  // anchorRight gets passed to Dropdown. It's truthy here unlike in the Dropdown.
  anchorRight: PropTypes.bool,
  children: PropTypes.arrayOf(
    PropTypes.shape({
      props: PropTypes.shape({
        onItemSelect: PropTypes.func
      })
    })
  ),
  iconID: PropTypes.string,
  disabledActions: PropTypes.bool
};

module.exports = PageHeaderActionsMenu;
