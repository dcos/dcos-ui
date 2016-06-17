import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class DividersTabContent extends React.Component {

  render() {
    return null;
  }
}

DividersTabContent.contextTypes = {
  router: React.PropTypes.func
};

DividersTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = DividersTabContent;
