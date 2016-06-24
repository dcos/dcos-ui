import classNames from 'classnames';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ConfigStore from '../../stores/ConfigStore';
import DescriptionList from '../../components/DescriptionList';
import MarathonStore from '../../stores/MarathonStore';

module.exports = class OverviewDetailTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      open: false
    };

    this.store_listeners = [
      {
        name: 'config',
        events: ['ccidSuccess']
      },
      {
        name: 'marathon',
        events: ['instanceInfoSuccess']
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    ConfigStore.fetchCCID();
    MarathonStore.fetchMarathonInstanceInfo();
  }

  getLoading() {
    return (
      <div className="loader-small ball-beat">
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }

  getClusterDetailsHash() {
    let ccid = ConfigStore.get('ccid');

    if (Object.keys(ccid).length) {
      ccid = ccid.zbase32_public_key;
    } else {
      ccid = this.getLoading();
    }

    return {
      'Cluster Details': {
        'Cryptographic Cluster ID': ccid
      }
    };
  }

  getMarathonDetailsHash() {
    let marathonDetails = MarathonStore.getInstanceInfo();

    if (!Object.keys(marathonDetails).length) {
      return null;
    };

    return {
      'Marathon Details': {
        'Version': marathonDetails.version,
        'Framework ID': marathonDetails.frameworkId,
        'Leader': marathonDetails.leader,
        'Marathon Config': marathonDetails.marathon_config,
        'ZooKeeper Config': marathonDetails.zookeeper_config
      }
    };
  }

  buildDescriptionList(hash, addSpacing) {
    let headlineClassName = classNames({
      'h4 inverse': true,
      'flush-top': !addSpacing
    });

    return (
      <DescriptionList
        dtClassName="column-3 text-mute text-overflow-break-word"
        hash={hash}
        headlineClassName={headlineClassName} />
    );
  }

  render() {
    let marathonHash = this.getMarathonDetailsHash();
    let marathonDetails = null;

    if (marathonHash) {
      marathonDetails = this.buildDescriptionList(marathonHash, true);
    }

    return (
      <div>
        {this.buildDescriptionList(this.getClusterDetailsHash())}
        {marathonDetails}
      </div>
    );
  }
};
