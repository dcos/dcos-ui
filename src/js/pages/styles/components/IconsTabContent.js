import React from 'react';

import IconAdd from 'babel!svg-react!../../../../img/icons/icon-add.svg?name=IconAdd';
import SidebarActions from '../../../events/SidebarActions';

class IconsTabContent extends React.Component {

  render() {
    return (
      <div>
        <h1 className="inverse flush-top short-bottom">Icons example</h1>
        <IconAdd className="icon icon-mini icon-purple" />
        <IconAdd className="icon icon-mini icon-white" />
      </div>
    );
  }
}

IconsTabContent.contextTypes = {
  router: React.PropTypes.func
};

IconsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = IconsTabContent;
