import {Link, RouteHandler} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Hooks} from 'PluginSDK';

import Icon from '../components/Icon';
import Page from '../components/Page';
import RouterUtil from '../utils/RouterUtil';
import SidebarActions from '../events/SidebarActions';
import TabsUtil from '../utils/TabsUtil';
import TabsMixin from '../mixins/TabsMixin';

let DEFAULT_NETWORK_TABS = {
  'virtual-networks-tab': {
    content: 'Virtual Networks',
    priority: 10
  }
};

const DEFAULT_NETWORK_SUB_TABS = {};

let NETWORK_TABS;

class NetworkPage extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);
    // Get top level tabs
    NETWORK_TABS = TabsUtil.sortTabs(
      Hooks.applyFilter('networkTabs', DEFAULT_NETWORK_TABS)
    );

    // Add filter to register default tab for Overview Tab
    Hooks.addFilter('virtual-networks-subtabs', function (tabs) {
      return Object.assign(tabs, DEFAULT_NETWORK_SUB_TABS);
    });

    this.tabs_tabs = {};

    this.state = {};
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

    // Get top level Tab
    let topLevelTab = currentTab.split('-').slice(0, 2).join('-');
    // Get top level tabs
    this.tabs_tabs = TabsUtil.sortTabs(
      Hooks.applyFilter(`${topLevelTab}-subtabs`, {})
    );

    this.setState({currentTab});
  }

  getRoutedItem(tab) {
    return (
      <Link
        to={tab}
        className="tab-item-label inverse flush">
        {NETWORK_TABS[tab]}
      </Link>
    );
  }

  getNavigation() {
    if (RouterUtil.shouldHideNavigation(this.context.router)) {
      return null;
    }

    let routes = this.context.router.getCurrentRoutes();
    let currentRoute = routes[routes.length - 1].name;

    return (
      <ul className="tabs list-inline flush-bottom inverse">
        {TabsUtil.getTabs(NETWORK_TABS, currentRoute, this.getRoutedItem)}
      </ul>
    );
  }

  getSubNavigation() {
    let subTabs = this.tabs_getRoutedTabs();
    if (RouterUtil.shouldHideNavigation(this.context.router) ||
      !subTabs.length) {
      return null;
    }

    return (
      <div className="container-pod container-pod-short flush-top">
        <div className="container-pod container-pod-divider-bottom container-pod-divider-inverse container-pod-divider-bottom-align-right flush-top flush-bottom">
          <ul className="tabs list-inline flush-bottom inverse">
            {subTabs}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Page
        title="Network"
        navigation={this.getNavigation()}>
        {this.getSubNavigation()}
        <RouteHandler currentTab={this.state.currentTab} />
      </Page>
    );
  }
}

NetworkPage.contextTypes = {
  router: React.PropTypes.func
};

NetworkPage.routeConfig = {
  label: 'Network',
  icon: <Icon id="network-hierarchical" />,
  matches: /^\/network/
};

NetworkPage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = NetworkPage;
