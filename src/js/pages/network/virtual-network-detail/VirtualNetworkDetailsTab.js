import React from 'react';

import ConfigurationMap from '../../../components/ConfigurationMap';
import DescriptionList from '../../../components/DescriptionList';
import Overlay from '../../../structs/Overlay';

class VirtualNetworkDetailsTab extends React.Component {
  render() {
    const {overlay} = this.props;

    let details = {
      Name: overlay.getName(),
      Network: overlay.getSubnet()
    };

    return (
      <div className="container">
        <ConfigurationMap>
          <DescriptionList hash={details} />
        </ConfigurationMap>
      </div>
    );
  }
}

VirtualNetworkDetailsTab.propTypes = {
  overlay: React.PropTypes.instanceOf(Overlay)
};

module.exports = VirtualNetworkDetailsTab;
