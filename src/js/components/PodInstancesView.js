import React from 'react';

import Pod from '../structs/Pod';
import PodInstancesTable from './PodInstancesTable';

class PodDetailInstancesView extends React.Component {
  render() {
    return (
      <PodInstancesTable
        inverseStyle={true}
        pod={this.props.pod} />
    );
  }
}

PodDetailInstancesView.contextTypes = {
  router: React.PropTypes.func
};

PodDetailInstancesView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetailInstancesView;
