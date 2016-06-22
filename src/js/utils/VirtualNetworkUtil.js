import AlertPanel from '../components/AlertPanel';
import {Link} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

const VirtualNetworkUtil = {
  getEmptyNetworkScreen() {
    return (
      <AlertPanel
        title="Virtual Network Not Found"
        iconClassName="icon icon-sprite icon-sprite-jumbo icon-sprite-jumbo-white icon-network flush-top">
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
