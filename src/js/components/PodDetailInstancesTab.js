import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Pod from '../structs/Pod';
import PodView from './PodView';

class PodDetailInstancesTab extends mixin(StoreMixin) {

  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'state', events: ['success']}
    ];
  }

  render() {
    return (
      <PodView pod={this.props.pod}
        inverseStyle={true}
        parentRouter={this.context.router} />
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
