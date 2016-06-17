import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ButtonCollectionsTabContent extends React.Component {

  render() {
    return null;
  }
}

ButtonCollectionsTabContent.contextTypes = {
  router: React.PropTypes.func
};

ButtonCollectionsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonCollectionsTabContent;
