import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
import {Link, RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../../components/AlertPanel';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageHeader from '../../../components/PageHeader';
import RequestErrorMsg from '../../../components/RequestErrorMsg';
import TabsMixin from '../../../mixins/TabsMixin';
import VirtualNetworksStore from '../../../stores/VirtualNetworksStore';

const METHODS_TO_BIND = [
  'onVirtualNetworksStoreError',
  'onVirtualNetworksStoreSuccess'
];

class VirtualNetworkDetail extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super();

    this.state = {
      receivedVirtualNetworks: false,
      errorCount: 0
    };

    this.tabs_tabs = {};

    this.store_listeners = [
      {
        name: 'virtualNetworks',
        events: ['success', 'error']
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
    let routes = this.context.router.getCurrentRoutes();
    let currentTab = routes[routes.length - 1].name;

    // Virtual Network Detail Tabs
    this.tabs_tabs = {
      'virtual-networks-tab-detail-tasks': 'Tasks',
      'virtual-networks-tab-detail-details': 'Details'
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

  isLoading() {
    return !this.state.receivedVirtualNetworks;
  }

  getBasicInfo(overlay) {
    if (!overlay) {
      return this.getEmptyScreen();
    }

    let overlayIcon = (
      <i className="icon icon-sprite icon-sprite-jumbo icon-sprite-jumbo-white icon-network" />
    );

    let tabs = (
      <ul className="tabs list-inline flush-bottom container-pod container-pod-short-top inverse">
        {this.tabs_getRoutedTabs({params: this.props.params})}
      </ul>
    );

    return (
      <PageHeader
        icon={overlayIcon}
        iconClassName="icon-app-container"
        subTitle={overlay.getSubnet()}
        navigationTabs={tabs}
        title={overlay.getName()} />
    );
  }

  getEmptyScreen() {
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

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getLoadingScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  render() {
    let {errorCount} = this.state;
    if (errorCount >= 3) {
      return this.getErrorScreen();
    }

    if (this.isLoading()) {
      return this.getLoadingScreen();
    }

    let overlay = VirtualNetworksStore.getOverlays().findItem((overlay) => {
      return overlay.getName() === this.props.params.overlayName;
    });

    return (
      <div className="flex-container-col flex-grow flex-shrink container-pod container-pod-divider-bottom-align-right container-pod-short-top flush-bottom flush-top">
        <Breadcrumbs />
        {this.getBasicInfo(overlay)}
        <RouteHandler overlay={overlay} />
      </div>
    );
  }
}

VirtualNetworkDetail.contextTypes = {
  router: React.PropTypes.func
};

module.exports = VirtualNetworkDetail;
