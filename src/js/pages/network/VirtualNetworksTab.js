import mixin from 'reactjs-mixin';
import {Link} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../components/AlertPanel';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import FilterInputText from '../../components/FilterInputText';
import Loader from '../../components/Loader';
import Page from '../../components/Page';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import VirtualNetworksStore from '../../stores/VirtualNetworksStore';
import VirtualNetworksTable from './VirtualNetworksTable';

const NetworksBreadcrumbs = () => {
  const crumbs = [
    <Link to="networking" key={-1}>Networking</Link>,
    <Link to="networking/networks" key={0}>Networks</Link>
  ];

  return <Page.Header.Breadcrumbs iconID="cluster" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = [
  'handleSearchStringChange',
  'onVirtualNetworksStoreError',
  'onVirtualNetworksStoreSuccess',
  'resetFilter'
];

class VirtualNetworksTabContent extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      receivedVirtualNetworks: false,
      searchString: '',
      errorCount: 0
    };

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

  handleSearchStringChange(searchString = '') {
    this.setState({searchString});
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

  resetFilter() {
    this.setState({searchString: ''});
  }

  getEmptyScreen() {
    return (
      <AlertPanel
        title="No virtual networks detected">
        <p className="flush">
          There a currently no other virtual networks found on your datacenter. Virtual networks are configured during setup of your DC/OS cluster.
        </p>
      </AlertPanel>
    );
  }

  getErrorScreen() {
    return (
      <RequestErrorMsg />
    );
  }

  getFilteredOverlayList(overlayList, searchString = '') {
    if (searchString === '') {
      return overlayList;
    }

    return overlayList.filterItems(function (overlay) {
      return overlay.getName().includes(searchString) ||
        overlay.getSubnet().includes(searchString);
    });
  }

  getLoadingScreen() {
    return (
      <Loader />
    );
  }

  getContent() {
    let {errorCount, searchString} = this.state;
    if (errorCount >= 3) {
      return this.getErrorScreen();
    }

    if (this.isLoading()) {
      return this.getLoadingScreen();
    }

    let overlayList = VirtualNetworksStore.getOverlays();
    let filteredOverlayList = this.getFilteredOverlayList(overlayList, searchString);
    if (filteredOverlayList.length === 0) {
      return this.getEmptyScreen();
    }

    return (
      <div>
        <FilterHeadline
          onReset={this.resetFilter}
          name="Network"
          currentLength={filteredOverlayList.getItems().length}
          totalLength={overlayList.getItems().length} />
        <FilterBar>
          <FilterInputText
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange} />
        </FilterBar>
        <VirtualNetworksTable overlays={filteredOverlayList} />
      </div>
    );
  }

  render() {
    return (
      <Page>
        <Page.Header breadcrumbs={<NetworksBreadcrumbs />} />
        {this.getContent()}
        {this.props.children}
      </Page>
    );
  }
}

VirtualNetworksTabContent.routeConfig = {
  label: 'Networks',
  matches: /^\/networking\/networks/
};

module.exports = VirtualNetworksTabContent;
