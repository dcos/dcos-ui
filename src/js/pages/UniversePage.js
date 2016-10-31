import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {routerShape} from 'react-router';

import Icon from '../components/Icon';
import Page from '../components/Page';
import RouterUtil from '../utils/RouterUtil';
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

  componentWillReceiveProps(nextProps) {
    this.updateCurrentTab(nextProps);
  }

  updateCurrentTab(nextProps) {
    let {routes} = nextProps || this.props;
    let currentTab = RouterUtil.reconstructPathFromRoutes(routes);

    // Universe Tabs
    this.tabs_tabs = {
      '/universe/packages': 'Packages',
      '/universe/installed-packages': 'Installed'
    };

    this.setState({currentTab});
  }

  getNavigation() {
    if (RouterUtil.shouldHideNavigation(this.props.routes)) {
      return null;
    }

    return (
      <ul className="menu-tabbed">
        {this.tabs_getRoutedTabs()}
      </ul>
    );
  }

  render() {
    return (
      <Page
        title="Universe"
        navigation={this.getNavigation()}>
        {this.props.children}
      </Page>
    );
  }
}

UniversePage.contextTypes = {
  router: routerShape
};

UniversePage.routeConfig = {
  label: 'Packages',
  icon: <Icon id="packages-inverse" size="small" family="small" />,
  matches: /^\/universe/
};

UniversePage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = UniversePage;
