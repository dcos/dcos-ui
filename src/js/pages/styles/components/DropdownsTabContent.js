import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class DropdownsTabContent extends React.Component {

  render() {
    return null;
  }
}

DropdownsTabContent.contextTypes = {
  router: React.PropTypes.object
};

DropdownsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = DropdownsTabContent;
