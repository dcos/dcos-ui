import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class TablesTabContent extends React.Component {

  render() {
    return null;
  }
}

TablesTabContent.contextTypes = {
  router: React.PropTypes.func
};

TablesTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = TablesTabContent;
