import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class ImagesTabContent extends React.Component {

  render() {
    return null;
  }
}

ImagesTabContent.contextTypes = {
  router: routerShape
};

ImagesTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ImagesTabContent;
