import {Link, RouteHandler} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Hooks} from 'PluginSDK';
import Page from '../components/Page';
import SidebarActions from '../events/SidebarActions';
import TabsUtil from '../utils/TabsUtil';
import TabsMixin from '../mixins/TabsMixin';

// Default Tabs
let DEFAULT_SERVICES_TABS = {
  'system-overview': {
    content: 'Overview',
    priority: 30
  },
  'system-organization': {
    content: 'Organization',
    priority: 20
  }
};

let DEFAULT_OVERVIEW_TABS = {
  'system-overview-units': {
    content: 'Components',
    priority: 20
  },
  'system-overview-repositories': {
    content: 'Repositories',
    priority: 10
  }
};

let DEFAULT_ORGANIZATION_TABS = {
  'system-organization-users': {
    content: 'Users',
    priority: 50
  }
};

let SYSTEM_TABS;

class SystemPage extends mixin(TabsMixin) {
  constructor() {
    super();

    // Get top level tabs
    SYSTEM_TABS = TabsUtil.sortTabs(
      Hooks.applyFilter('SystemTabs', DEFAULT_SERVICES_TABS)
    );
    // Add filter to register default tab for Overview Tab
    Hooks.addFilter('system-overview-tabs', function (tabs) {
      return Object.assign(tabs, DEFAULT_OVERVIEW_TABS);
    });
    // Add filter to register default tab for Organization Tab
    Hooks.addFilter('system-organization-tabs', function (tabs) {
      return Object.assign(tabs, DEFAULT_ORGANIZATION_TABS);
    });

    this.tabs_tabs = {};
    this.state = {};
  }

  componentWillMount() {
    this.updateCurrentTab();
  }

  componentWillReceiveProps() {
    this.updateCurrentTab();
  }

  updateCurrentTab() {
    let routes = this.context.router.getCurrentRoutes();
    let currentTab = routes[routes.length - 1].name;
    // Get top level Tab
    let topLevelTab = currentTab.split('-').slice(0, 2).join('-');

    this.tabs_tabs = TabsUtil.sortTabs(
      Hooks.applyFilter(`${topLevelTab}-tabs`, {})
    );

    this.setState({currentTab});
  }

  getRoutedItem(tab) {
    return (
      <Link
        to={tab}
        className="tab-item-label inverse flush">
        {SYSTEM_TABS[tab]}
      </Link>
    );
  }

  getNavigation() {
    let routes = this.context.router.getCurrentRoutes();
    let currentRoute = routes[routes.length - 2].name;

    return (
      <ul className="tabs list-inline flush-bottom inverse">
        {TabsUtil.getTabs(
          SYSTEM_TABS,
          currentRoute,
          this.getRoutedItem
        )}
      </ul>
    );
  }

  getSubNavigation() {
    return (
      <ul className="tabs list-inline flush-bottom inverse">
        {this.tabs_getRoutedTabs()}
      </ul>
    );
  }

  render() {
    return (
      <Page
        title="System"
        navigation={this.getNavigation()}>
        <div className="container-pod container-pod-short flush-top">
          <div className="container-pod container-pod-divider-bottom container-pod-divider-inverse container-pod-divider-bottom-align-right flush-top flush-bottom">
            {this.getSubNavigation()}
          </div>
        </div>
        <RouteHandler currentTab={this.state.currentTab} />
      </Page>
    );
  }
}

SystemPage.contextTypes = {
  router: React.PropTypes.func
};

SystemPage.routeConfig = {
  label: 'System',
  icon: 'system',
  matches: /^\/system/
};

SystemPage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = SystemPage;
