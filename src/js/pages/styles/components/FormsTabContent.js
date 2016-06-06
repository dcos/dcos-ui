import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class FormTabContent extends React.Component {

  render() {
    return (
      <div>
        Forms example
        <form>
          <input type="text" />
        </form>
      </div>
    );
  }
}

FormTabContent.contextTypes = {
  router: React.PropTypes.func
};

FormTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = FormTabContent;
