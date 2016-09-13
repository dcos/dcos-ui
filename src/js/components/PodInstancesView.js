import React from 'react';

import Pod from '../structs/Pod';
import PodInstancesTable from './PodInstancesTable';

class PodDetailInstancesTab extends React.Component {

  constructor() {
    super(...arguments);
  }

  render() {
    return (
      <PodInstancesTable
        inverseStyle={true}
        pod={this.props.pod} />
    );
  }
}

PodDetailInstancesTab.contextTypes = {
  router: React.PropTypes.func
};

PodDetailInstancesTab.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetailInstancesTab;
