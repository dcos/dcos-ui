import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class CodeTabContent extends React.Component {

  render() {
    return null;
  }
}

CodeTabContent.contextTypes = {
  router: React.PropTypes.func
};

CodeTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = CodeTabContent;
