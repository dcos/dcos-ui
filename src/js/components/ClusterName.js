import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import MesosSummaryStore from '../stores/MesosSummaryStore';

class ClusterName extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [{
      name: 'summary',
      events: ['success'],
      listenAlways: false
    }];
  }

  render() {
    let states = MesosSummaryStore.get('states');
    let clusterName = '';

    if (states) {
      let lastState = states.lastSuccessful();

      if (lastState) {
        clusterName = lastState.getClusterName();
      }
    }

    return (
      <span
        className="header-title h5 inverse text-overflow flush"
        title={clusterName}>
        {clusterName}
      </span>
    );
  }
}

module.exports = ClusterName;
