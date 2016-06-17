import React from 'react';

// import IconAdd from '../../../../img/icons/icon-add.svg?name=IconAdd';
import SidebarActions from '../../../events/SidebarActions';

class IconsTabContent extends React.Component {

  render() {
    return null;
  }
}

IconsTabContent.contextTypes = {
  router: React.PropTypes.func
};

IconsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = IconsTabContent;
