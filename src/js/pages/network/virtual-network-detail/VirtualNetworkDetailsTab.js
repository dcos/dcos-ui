import React from 'react';

import ConfigurationMap from '../../../components/ConfigurationMap';
import HashMapDisplay from '../../../components/HashMapDisplay';
import Overlay from '../../../structs/Overlay';

class VirtualNetworkDetailsTab extends React.Component {
  render() {
    const {overlay} = this.props;

    let details = {
      Name: overlay.getName(),
      'IP Subnet': overlay.getSubnet()
    };

    return (
      <div className="container">
        <ConfigurationMap>
          <HashMapDisplay hash={details} />
        </ConfigurationMap>
      </div>
    );
  }
}

VirtualNetworkDetailsTab.propTypes = {
  overlay: React.PropTypes.instanceOf(Overlay)
};

module.exports = VirtualNetworkDetailsTab;
