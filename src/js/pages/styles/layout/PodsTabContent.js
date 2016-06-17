import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class PodsTabContent extends React.Component {

  render() {
    return null;
  }
}

PodsTabContent.contextTypes = {
  router: React.PropTypes.func
};

PodsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = PodsTabContent;
