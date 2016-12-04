import {Dropdown} from 'reactjs-components';
import React from 'react';

import Icon from './Icon';

const getMenuItems = (children) => {
  return [
    {
      className: 'hidden',
      html: <Icon id="ellipsis-vertical" size="mini" />,
      id: 'trigger'
    },
    ...React.Children.map(children, getDropdownItemFromComponent)
  ];
};

const handleItemSelection = (item) => {
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

const PageHeaderActionsMenu = ({children}) => {
  return (
    <Dropdown
      buttonClassName="button button-link"
      items={getMenuItems(children)}
      onItemSelection={handleItemSelection}
      persistentID="trigger"
      transition={true}
      dropdownMenuClassName="dropdown-menu"
      dropdownMenuListClassName="dropdown-menu-list"
      wrapperClassName="dropdown" />
  );
};

PageHeaderActionsMenu.defaultProps = {
  anchorRight: true
};

PageHeaderActionsMenu.propTypes = {
  // anchorRight gets passed to Dropdown. It's truthy here unlike in the Dropdown.
  anchorRight: React.PropTypes.bool,
  children: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      props: React.PropTypes.shape({
        onItemSelect: React.PropTypes.func
      })
    })
  )
};

module.exports = PageHeaderActionsMenu;
