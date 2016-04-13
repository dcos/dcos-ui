import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';

import Page from '../components/Page';
import SidebarActions from '../events/SidebarActions';
import TabsMixin from '../mixins/TabsMixin';

class UniversePage extends mixin(TabsMixin) {
  constructor() {
    super();

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

    // Universe Tabs
    this.tabs_tabs = {
      'universe-packages': 'Packages',
      'universe-installed-packages': 'Installed'
    };

    this.setState({currentTab});
  }

  getNavigation() {
    return (
      <ul className="tabs list-inline flush-bottom inverse">
        {this.tabs_getRoutedTabs()}
      </ul>
    );
  }

  render() {
    return (
      <Page
        title="Universe"
        navigation={this.getNavigation()}>
        <RouteHandler />
      </Page>
    );
  }
}

UniversePage.contextTypes = {
  router: React.PropTypes.func
};

UniversePage.routeConfig = {
  label: 'Universe',
  icon: 'universe',
  matches: /^\/universe/
};

UniversePage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = UniversePage;
