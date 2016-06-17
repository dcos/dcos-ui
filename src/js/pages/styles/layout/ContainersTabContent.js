import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ContainersTabContent extends React.Component {

  render() {
    return null;
  }
}

ContainersTabContent.contextTypes = {
  router: React.PropTypes.func
};

ContainersTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ContainersTabContent;
