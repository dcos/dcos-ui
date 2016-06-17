import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ResponsiveUtilitiesTabContent extends React.Component {

  render() {
    return null;
  }
}

ResponsiveUtilitiesTabContent.contextTypes = {
  router: React.PropTypes.func
};

ResponsiveUtilitiesTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ResponsiveUtilitiesTabContent;
