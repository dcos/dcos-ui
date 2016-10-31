import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class DropdownsTabContent extends React.Component {

  render() {
    return null;
  }
}

DropdownsTabContent.contextTypes = {
  router: routerShape
};

DropdownsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = DropdownsTabContent;
