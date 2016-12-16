import mixin from 'reactjs-mixin';
import {Link} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Config from '../../config/Config';
import ConfigStore from '../../stores/ConfigStore';
import ConfigurationMap from '../../components/ConfigurationMap';
import ConfigurationMapHeading from '../../components/ConfigurationMapHeading';
import DescriptionList from '../../components/DescriptionList';
import Loader from '../../components/Loader';
import MetadataStore from '../../stores/MetadataStore';
import MarathonStore from '../../../../plugins/services/src/js/stores/MarathonStore';
import Page from '../../components/Page';

const ClusterDetailsBreadcrumbs = () => {
  const crumbs = [
    <Link to="/cluster" key={-1}>Cluster</Link>
  ];

  return <Page.Header.Breadcrumbs iconID="cluster" breadcrumbs={crumbs} />;
};

class OverviewDetailTab extends mixin(StoreMixin) {
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
      },
      {
        name: 'metadata',
        events: ['dcosSuccess']
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    ConfigStore.fetchCCID();
    MarathonStore.fetchMarathonInstanceInfo();
  }

  getLoading() {
    return <Loader size="small" type="ballBeat" />;
  }

  getClusterDetailsHash() {
    let ccid = ConfigStore.get('ccid');
    let productVersion = MetadataStore.version;

    if (Object.keys(ccid).length) {
      ccid = ccid.zbase32_public_key;
    } else {
      ccid = this.getLoading();
    }

    if (productVersion == null) {
      productVersion = this.getLoading();
    }

    return {
      [`${Config.productName} Version`]: productVersion,
      'Cryptographic Cluster ID': ccid
    };
  }

  getMarathonDetailsHash() {
    const marathonDetails = MarathonStore.getInstanceInfo();

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

  render() {
    const marathonHash = this.getMarathonDetailsHash();
    let marathonDetails = null;

    if (marathonHash) {
      marathonDetails = <DescriptionList hash={marathonHash} />;
    }

    return (
      <Page>
        <Page.Header breadcrumbs={<ClusterDetailsBreadcrumbs />} />
        <div className="container">
          <ConfigurationMap>
            <ConfigurationMapHeading className="flush-top">
              Cluster Details
            </ConfigurationMapHeading>
            <DescriptionList hash={this.getClusterDetailsHash()} />
            {marathonDetails}
          </ConfigurationMap>
          {versionsModal}
        </div>
      </Page>
    );
  }
};

OverviewDetailTab.routeConfig = {
  label: 'Overview',
  matches: /^\/cluster\/details/
};

module.exports = OverviewDetailTab;
