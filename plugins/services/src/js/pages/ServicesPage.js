import React from 'react';
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Icon from '../../../../../src/js/components/Icon';
import Page from '../../../../../src/js/components/Page';
import RouterUtil from '../../../../../src/js/utils/RouterUtil';
import TabsMixin from '../../../../../src/js/mixins/TabsMixin';

var ServicesPage = React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [TabsMixin, StoreMixin],

  displayName: 'ServicesPage',

  statics: {
    routeConfig: {
      label: 'Services',
      icon: <Icon id="services-inverse" size="small" family="small" />,
      matches: /^\/services/
    }
  },

  getInitialState() {
    return {
      currentTab: 'services-page'
    };
  },

  componentWillMount() {
    this.store_listeners = [
      {name: 'notification', events: ['change'], suppressUpdate: false}
    ];
    this.tabs_tabs = {
      'services-page': 'Services',
      'services-deployments': 'Deployments'
    };
    this.updateCurrentTab();
  },

  componentDidUpdate() {
    this.updateCurrentTab();
  },

  updateCurrentTab() {
    let routes = this.context.router.getCurrentRoutes();
    let currentTab = routes[routes.length - 1].name;
    // `services-page` tab also contains routes for 'services-details'
    if (currentTab === 'services-detail' || currentTab == null) {
      currentTab = 'services-page';
    }

    if (this.state.currentTab !== currentTab) {
      this.setState({currentTab});
    }
  },

  getNavigation() {
    if (RouterUtil.shouldHideNavigation(this.context.router)) {
      return null;
    }

    return (
      <ul className="menu-tabbed">
        {this.tabs_getRoutedTabs()}
      </ul>
    );
  },

  render() {
    const {
      params,
      query
    } = this.props;

    // Make sure to grow when logs are displayed
    let routes = this.context.router.getCurrentRoutes();

    return (
      <Page
        navigation={this.getNavigation()}
        dontScroll={routes[routes.length - 1].dontScroll}
        title="Services">
        <RouteHandler params={params} query={query} />
      </Page>
    );
  }

});

module.exports = ServicesPage;
