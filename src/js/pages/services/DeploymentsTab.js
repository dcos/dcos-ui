import React from 'react';

import AlertPanel from '../../components/AlertPanel';

class DeploymentsTab extends React.Component {

  constructor() {
    super(...arguments);
  }

  renderEmpty() {
    return (
      <AlertPanel
        title="No Deployments"
        iconClassName="icon icon-sprite icon-sprite-jumbo
            icon-sprite-jumbo-white icon-services flush-top">
        <p className="flush">Active deployments will be shown here.</p>
      </AlertPanel>
    );
  }

  render() {
    return this.renderEmpty();
  }

}

module.exports = DeploymentsTab;

