import React from 'react';

import AlertPanel from '../../components/AlertPanel';

var DeploymentsTab = React.createClass({

  displayName: 'DeploymentsTab',

  renderEmpty: function () {
    return (
      <AlertPanel
        title="No Deployments"
        iconClassName="icon icon-sprite icon-sprite-jumbo
            icon-sprite-jumbo-white icon-services flush-top">
        <p className="flush">Active deployments will be shown here.</p>
      </AlertPanel>
    );
  },

  render: function () {
    return this.renderEmpty();
  }

});

module.exports = DeploymentsTab;

