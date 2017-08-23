/* @flow */
import { Dropdown } from "reactjs-components";
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

type Props = {
  // anchorRight gets passed to Dropdown. It's truthy here unlike in the Dropdown.
  anchorRight?: boolean,
  children?: Array<{ props?: { onItemSelect?: Function } }>,
  iconID?: string
};

const PageHeaderActionsMenu = (props: Props) => {
  const { anchorRight, children, iconID } = props;
  return (
    <Dropdown
      anchorRight={anchorRight}
      buttonClassName="button button-link button-narrow"
      items={getMenuItems(children, iconID)}
      onItemSelection={handleItemSelection}
      persistentID="trigger"
      transition={true}
      dropdownMenuClassName="dropdown-menu"
      dropdownMenuListClassName="dropdown-menu-list"
      wrapperClassName="dropdown"
    />
  );
};

PageHeaderActionsMenu.defaultProps = {
  anchorRight: true,
  iconID: "ellipsis-vertical"
};

module.exports = PageHeaderActionsMenu;
