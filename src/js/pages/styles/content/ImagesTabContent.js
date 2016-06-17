import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ImagesTabContent extends React.Component {

  render() {
    return null;
  }
}

ImagesTabContent.contextTypes = {
  router: React.PropTypes.func
};

ImagesTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ImagesTabContent;
