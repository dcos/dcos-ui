import {Link, RouteHandler} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {Hooks} from 'PluginSDK';

import Icon from '../components/Icon';
import NotificationStore from '../stores/NotificationStore';
import Page from '../components/Page';
import RouterUtil from '../utils/RouterUtil';
import SidebarActions from '../events/SidebarActions';
import TabsUtil from '../utils/TabsUtil';
import TabsMixin from '../mixins/TabsMixin';

let DEFAULT_OVERVIEW_TABS = {
  'system-overview-details': {
    content: 'Details',
    priority: 30
  },
  'system-overview-units': {
    content: 'Components',
    priority: 20
  },
  'system-overview-repositories': {
    content: 'Repositories',
    priority: 10
  }
};

let DEFAULT_ORGANIZATION_TABS = {};

let SYSTEM_TABS;

function getParentTabIfChildrenExist(key, tabDefinition) {
  if (!Object.keys(Hooks.applyFilter(`${key}-tabs`, {})).length) {
    return {};
  }

  return {[key]: tabDefinition};
}

class SystemPage extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    // Add filter to register default tab for Overview Tab
    Hooks.addFilter('system-overview-tabs', function (tabs) {
      return Object.assign(tabs, DEFAULT_OVERVIEW_TABS);
    });

    // Check if organization tab
    // Add filter to register default tab for Organization Tab
    Hooks.addFilter('system-organization-tabs', function (tabs) {
      return Object.assign(tabs, DEFAULT_ORGANIZATION_TABS);
    });

    // Default Tabs
    let defaultSystemTabs = Object.assign({},
      getParentTabIfChildrenExist('system-overview', {
        content: 'Overview',
        priority: 30
      }),
      getParentTabIfChildrenExist('system-organization', {
        content: 'Organization',
        priority: 20
      })
    );

    // Get top level tabs
    SYSTEM_TABS = TabsUtil.sortTabs(
      Hooks.applyFilter('system-tabs', defaultSystemTabs)
    );

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
    let notificationCount = NotificationStore.getNotificationCount(tab);

    if (notificationCount > 0) {
      return (
        <Link
          to={tab}
          className="tab-item-label inverse flush">
          <span className="tab-item-label-text">
            {SYSTEM_TABS[tab]}
          </span>
          <span className="badge-container badge-primary">
            <span className="badge text-align-center">{notificationCount}</span>
          </span>
        </Link>
      );
    }

    return (
      <Link
        to={tab}
        className="tab-item-label inverse flush">
        <span className="tab-item-label-text">
          {SYSTEM_TABS[tab]}
        </span>
      </Link>
    );
  }

  getNavigation() {
    if (RouterUtil.shouldHideNavigation(this.context.router)) {
      return null;
    }

    let routes = this.context.router.getCurrentRoutes();
    let currentRoute = routes[routes.length - 2].name;

    return (
      <ul className="menu-tabbed inverse">
        {TabsUtil.getTabs(
          SYSTEM_TABS,
          currentRoute,
          this.getRoutedItem
        )}
      </ul>
    );
  }

  getSubNavigation() {
    if (RouterUtil.shouldHideNavigation(this.context.router)) {
      return null;
    }

    return (
      <div className="container-pod container-pod-short flush-top">
        <div className="container-pod container-pod-divider-bottom container-pod-divider-inverse container-pod-divider-bottom-align-right flush-top flush-bottom">
           <ul className="menu-tabbed inverse">
            {this.tabs_getRoutedTabs()}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Page
        title="System"
        navigation={this.getNavigation()}>
        {this.getSubNavigation()}
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
  icon: <Icon id="gear-inverse" size="small" family="small" />,
  matches: /^\/system/
};

SystemPage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = SystemPage;
