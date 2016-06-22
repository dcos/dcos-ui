import React from 'react';

import Overlay from '../../../structs/Overlay';
import DescriptionList from '../../../components/DescriptionList';

class VirtualNetworkDetailsTab extends React.Component {
  render() {
    let {overlay} = this.props;

    let details = {
      Name: overlay.getName(),
      Network: overlay.getSubnet()
    }

    return (
      <DescriptionList hash={details} />
    );
  }
}

VirtualNetworkDetailsTab.propTypes = {
  overlay: React.PropTypes.instanceOf(Overlay)
}

module.exports = VirtualNetworkDetailsTab;
