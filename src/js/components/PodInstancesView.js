import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Pod from '../structs/Pod';
import PodInstancesTable from './PodInstancesTable';

class PodDetailInstancesTab extends mixin(StoreMixin) {

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
