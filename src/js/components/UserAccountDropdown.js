import React from 'react';

import ClusterHeader from './ClusterHeader';
import {Dropdown} from 'reactjs-components';

let styledItemsList = [
  {
    className: 'hidden',
    html: <ClusterHeader />,
    id: 'dropdown-trigger'
  },
  {
    className: 'dropdown-menu-section-header',
    html: <label>Support</label>,
    id: 'header-a',
    selectable: false
  },
  {
    html: <span>Documentation</span>,
    id: 'documentation'
  },
  {
    html: <span>Install CLI</span>,
    id: 'install-cli'
  },
  {
    className: 'dropdown-menu-section-header',
    html: <label>User</label>,
    id: 'header-b',
    selectable: false
  },
  {
    html: <span>Username</span>,
    id: 'username'
  },
  {
    html: <span>Sign Out</span>,
    id: 'sign-out'
  }
];

const UserAccountDropdown = (props) => {
  return (
    <Dropdown buttonClassName="user-account-dropdown-button"
      dropdownMenuClassName="user-account-dropdown-menu dropdown-menu"
      dropdownMenuListClassName="user-account-dropdown-list dropdown-menu-list"
      items={styledItemsList}
      initialID="dropdown-trigger"
      transition={true}
      wrapperClassName="user-account-dropdown dropdown header flex-item-shrink-0" />
  );
};

module.exports = UserAccountDropdown;
