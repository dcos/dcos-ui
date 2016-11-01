import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class CodeTabContent extends React.Component {

  render() {
    return null;
  }
}

CodeTabContent.contextTypes = {
  router: routerShape
};

CodeTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = CodeTabContent;
