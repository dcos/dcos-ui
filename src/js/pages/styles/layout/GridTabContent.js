import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class GridTabContent extends React.Component {

  render() {
    return null;
  }
}

GridTabContent.contextTypes = {
  router: React.PropTypes.func
};

GridTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = GridTabContent;
