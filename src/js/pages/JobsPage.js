import mixin from 'reactjs-mixin';
import React from 'react';
import {RouteHandler} from 'react-router';

import Page from '../components/Page';
import SidebarActions from '../events/SidebarActions';
import TabsMixin from '../mixins/TabsMixin';

class JobsPage extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {'jobs': 'Jobs'};
    this.state = {currentTab: 'jobs'};
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

    if (currentTab != null) {
      this.setState({currentTab});
    }
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
      <Page navigation={this.getNavigation()} title="Jobs">
        <RouteHandler />
      </Page>
    );
  }
}

JobsPage.contextTypes = {
  router: React.PropTypes.func
};

JobsPage.routeConfig = {
  label: 'Jobs',
  icon: 'jobs',
  matches: /^\/jobs/
};

JobsPage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = JobsPage;
