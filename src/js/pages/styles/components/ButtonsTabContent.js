import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ButtonTabContent extends React.Component {

  render() {
    return (
      <div>
      </div>
    );
  }
}

ButtonTabContent.contextTypes = {
  router: React.PropTypes.func
};

ButtonTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonTabContent;
