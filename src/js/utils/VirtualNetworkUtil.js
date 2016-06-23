import {Link} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import AlertPanel from '../components/AlertPanel';
import Icon from '../components/Icon';

const VirtualNetworkUtil = {
  getEmptyNetworkScreen() {
    return (
      <AlertPanel
        title="Virtual Network Not Found"
        icon={<Icon id="network-hierarchical" color="white" size="jumbo" />}>
        <p className="flush">
          {'Could not find the requested virtual network. Go to '}
          <Link to="virtual-networks-tab">
            Virtual Networks
          </Link> overview to see all virtual networks.
        </p>
      </AlertPanel>
    );
  }
}

module.exports = VirtualNetworkUtil;
