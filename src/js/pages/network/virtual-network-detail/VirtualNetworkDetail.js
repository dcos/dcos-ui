import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../../components/Breadcrumbs';
import DetailViewHeader from '../../../components/DetailViewHeader';
import Icon from '../../../components/Icon';
import Loader from '../../../components/Loader';
import RequestErrorMsg from '../../../components/RequestErrorMsg';
import TabsMixin from '../../../mixins/TabsMixin';
import VirtualNetworksStore from '../../../stores/VirtualNetworksStore';
import VirtualNetworkUtil from '../../../utils/VirtualNetworkUtil';

const METHODS_TO_BIND = [
  'onVirtualNetworksStoreError',
  'onVirtualNetworksStoreSuccess'
];

class VirtualNetworkDetail extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      errorCount: 0,
      receivedVirtualNetworks: false
    };

    this.tabs_tabs = {};

    this.store_listeners = [
      {
        name: 'virtualNetworks',
        events: ['success', 'error'],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount(...arguments);
    this.updateCurrentTab();
  }

  componentWillReceiveProps() {
    super.componentWillReceiveProps(...arguments);
    this.updateCurrentTab();
  }

  updateCurrentTab() {
    let routes = this.props.routes;
    let currentTab = routes[routes.length - 1].path;

    // Virtual Network Detail Tabs
    this.tabs_tabs = {
      '/network/virtual-networks/:overlayName': 'Tasks',
      '/network/virtual-networks/:overlayName/details': 'Details'
    };

    this.setState({currentTab});
  }

  onVirtualNetworksStoreError() {
    let errorCount = this.state.errorCount + 1;
    this.setState({errorCount});
  }

  onVirtualNetworksStoreSuccess() {
    this.setState({receivedVirtualNetworks: true, errorCount: 0});
  }

  getBasicInfo(overlay) {
    if (!overlay) {
      return VirtualNetworkUtil.getEmptyNetworkScreen();
    }

    let overlayIcon = <Icon id="network" size="large" color="neutral" />;

    let tabs = (
      <ul className="menu-tabbed">
        {this.tabs_getRoutedTabs({params: this.props.params})}
      </ul>
    );

    return (
      <DetailViewHeader
        icon={overlayIcon}
        subTitle={overlay.getSubnet()}
        navigationTabs={tabs}
        title={overlay.getName()} />
    );
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getLoadingScreen() {
    return (
      <div className="pod">
        <Loader />
      </div>
    );
  }

  render() {
    let {errorCount, receivedVirtualNetworks} = this.state;
    if (errorCount >= 3) {
      return this.getErrorScreen();
    }

    if (!receivedVirtualNetworks) {
      return this.getLoadingScreen();
    }

    let overlay = VirtualNetworksStore.getOverlays().findItem((overlay) => {
      return overlay.getName() === this.props.params.overlayName;
    });

    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        {this.getBasicInfo(overlay)}
        {React.cloneElement(this.props.children, { overlay })}
      </div>
    );
  }
}

VirtualNetworkDetail.contextTypes = {
  router: React.PropTypes.object
};

module.exports = VirtualNetworkDetail;
