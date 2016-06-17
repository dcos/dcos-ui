import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ButtonGroupsTabContent extends React.Component {

  render() {
    return null;
  }
}

ButtonGroupsTabContent.contextTypes = {
  router: React.PropTypes.func
};

ButtonGroupsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonGroupsTabContent;
