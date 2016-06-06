import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class GridTabContent extends React.Component {

  render() {
    return (
      <div>
        Grid example
        <div className="row">
          <div className="column-4">column-4</div>
        </div>
      </div>
    );
  }
}

GridTabContent.contextTypes = {
  router: React.PropTypes.func
};

GridTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = GridTabContent;
