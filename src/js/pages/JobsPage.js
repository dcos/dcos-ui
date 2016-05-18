import React from 'react';
import {RouteHandler} from 'react-router';

import Page from '../components/Page';
import TabsMixin from '../mixins/TabsMixin';

var JobsPage = React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [TabsMixin],

  displayName: 'JobsPage',

  statics: {
    routeConfig: {
      label: 'Jobs',
      icon: 'jobs',
      matches: /^\/jobs/
    }
  },

  getInitialState: function () {
    return {
      currentTab: 'jobs-page'
    };
  },

  componentWillMount: function () {
    this.tabs_tabs = {
      'jobs-page': 'Jobs'
    };
    this.updateCurrentTab();
  },

  updateCurrentTab: function () {
    let routes = this.context.router.getCurrentRoutes();
    let currentTab = routes[routes.length - 1].name;
    if (currentTab != null) {
      this.setState({currentTab});
    }
  },

  getNavigation: function () {
    return (
      <ul className="tabs list-inline flush-bottom inverse">
        {this.tabs_getRoutedTabs()}
      </ul>
    );
  },

  render: function () {
    return (
      <Page
        navigation={this.getNavigation()}
        title="Jobs">
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = JobsPage;
