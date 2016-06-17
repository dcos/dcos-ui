import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ColorsTabContent extends React.Component {

  render() {
    return null;
  }
}

ColorsTabContent.contextTypes = {
  router: React.PropTypes.func
};

ColorsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ColorsTabContent;
