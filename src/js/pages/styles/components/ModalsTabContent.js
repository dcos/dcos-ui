import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ModalsTabContent extends React.Component {

  render() {
    return null;
  }
}

ModalsTabContent.contextTypes = {
  router: React.PropTypes.func
};

ModalsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ModalsTabContent;
