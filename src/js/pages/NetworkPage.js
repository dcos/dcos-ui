import {routerShape, Link} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Hooks} from 'PluginSDK';

import Icon from '../components/Icon';
import Loader from '../components/Loader';
import Page from '../components/Page';
import RouterUtil from '../utils/RouterUtil';
import SidebarActions from '../events/SidebarActions';
import TabsUtil from '../utils/TabsUtil';
import TabsMixin from '../mixins/TabsMixin';

let DEFAULT_NETWORK_TABS = {
  '/network/virtual-networks': {
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

    let networkPageReady = Hooks.applyFilter(
      'networkPageReady', Promise.resolve({isReady: true})
    );

    if (!networkPageReady.isReady) {
      // Set page ready once promise resolves
      networkPageReady.then(() => {
        this.setState({networkPageReady: true});
        this.updateCurrentTab(this.props);
      });
    }

    this.setState({networkPageReady: networkPageReady.isReady});
    this.updateCurrentTab(this.props);
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    this.updateCurrentTab(nextProps);
  }

  updateCurrentTab(nextProps) {
    let {routes} = nextProps || this.props;
    let currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    let topLevelTab = currentTab.split('/')[2];

    this.tabs_tabs = TabsUtil.sortTabs(
      Hooks.applyFilter(`${topLevelTab}-subtabs`, {})
    );

    this.setState({currentTab});
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getRoutedItem(tab) {
    return (
      <Link to={tab} className="menu-tabbed-item-label flush">
        {NETWORK_TABS[tab]}
      </Link>
    );
  }

  getNavigation() {
    let {routes} = this.props;

    if (RouterUtil.shouldHideNavigation(routes)) {
      return null;
    }

    let currentTab = RouterUtil.reconstructPathFromRoutes(routes);

    return (
      <ul className="menu-tabbed">
        {TabsUtil.getTabs(NETWORK_TABS, currentTab, this.getRoutedItem)}
      </ul>
    );
  }

  getSubNavigation() {
    let subTabs = this.tabs_getRoutedTabs();
    if (RouterUtil.shouldHideNavigation(this.props.routes) ||
      !subTabs.length) {
      return null;
    }

    return (
      <div className="pod pod-short flush-top flush-right flush-left">
        <ul className="menu-tabbed">
          {subTabs}
        </ul>
      </div>
    );
  }

  render() {
    if (!this.state.networkPageReady) {
      return (
        <Page
          title="Network"
          navigation={this.getNavigation()}>
          {this.getLoadingScreen()}
        </Page>
      );
    }

    // Make sure to grow when logs are displayed
    let routes = this.props.routes;
    let {currentTab} = this.state;
    return (
      <Page
        title="Network"
        navigation={this.getNavigation()}
        dontScroll={routes[routes.length - 1].dontScroll}>
        {this.getSubNavigation()}
        {React.cloneElement(this.props.children, { currentTab })}
      </Page>
    );
  }
}

NetworkPage.contextTypes = {
  router: routerShape
};

NetworkPage.routeConfig = {
  label: 'Networking',
  icon: <Icon id="network-hierarchical-inverse" size="small" family="small" />,
  matches: /^\/network/
};

NetworkPage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = NetworkPage;
