import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class TypographyTabContent extends React.Component {

  render() {
    return (
      <div>

      </div>
    );
  }
}

TypographyTabContent.contextTypes = {
  router: React.PropTypes.func
};

TypographyTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = TypographyTabContent;
