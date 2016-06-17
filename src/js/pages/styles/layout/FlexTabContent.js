import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class FlexTabContent extends React.Component {

  render() {
    return null;
  }
}

FlexTabContent.contextTypes = {
  router: React.PropTypes.func
};

FlexTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = FlexTabContent;
