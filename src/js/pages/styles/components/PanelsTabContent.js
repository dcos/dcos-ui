import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class PanelsTabContent extends React.Component {

  render() {
    return null;
  }
}

PanelsTabContent.contextTypes = {
  router: React.PropTypes.func
};

PanelsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = PanelsTabContent;
