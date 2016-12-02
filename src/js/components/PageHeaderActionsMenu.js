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
  if (item.clickHandler) {
    item.clickHandler();
  }
};

const getDropdownItemFromComponent = (child) => {
  return {
    clickHandler: child.props.clickHandler,
    html: child,
    id: child.key
  };
};

const PageHeaderActionsMenu = (props) => {
  return (
    <Dropdown
      buttonClassName="button button-link"
      items={getMenuItems(props.children)}
      onItemSelection={handleItemSelection}
      persistentID="trigger"
      transition={true}
      dropdownMenuClassName="dropdown-menu"
      dropdownMenuListClassName="dropdown-menu-list"
      wrapperClassName="dropdown"
      {...props} />
  );
};

PageHeaderActionsMenu.defaultProps = {
  anchorRight: true
};

PageHeaderActionsMenu.propTypes = {
  anchorRight: React.PropTypes.bool,
  children: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      props: React.PropTypes.shape({
        clickHandler: React.PropTypes.func
      }),
      key: React.PropTypes.string.isRequired
    })
  )
};

module.exports = PageHeaderActionsMenu;
