import {Link, RouteHandler} from 'react-router';
import mixin from 'reactjs-mixin';
import React from 'react';

import Page from '../components/Page';
import TabsMixin from '../mixins/TabsMixin';
import TabsUtil from '../utils/TabsUtil';

const STYLES_TABS = {
  'styles-layout-tab': 'Layout',
  'styles-content-tab': 'Content',
  'styles-components-tab': 'Components'
};

const STYLES_SUB_TABS = {
  'styles-layout-tab': {
    'styles-layout-containers': 'Containers',
    'styles-layout-grid': 'Grid',
    'styles-layout-pods': 'Pods',
    'styles-layout-flex': 'Flex',
    'styles-layout-dividers': 'Dividers',
    'styles-layout-responsive-utilities': 'Responsive Utilities'
  },
  'styles-content-tab': {
    'styles-content-typography': 'Typography',
    'styles-content-tables': 'Tables',
    'styles-content-colors': 'Colors',
    'styles-content-code': 'Code',
    'styles-content-images': 'Images'
  },
  'styles-components-tab': {
    'styles-components-buttons': 'Buttons',
    'styles-components-button-groups': 'Button Groups',
    'styles-components-button-collections': 'Button Collections',
    'styles-components-forms': 'Forms',
    'styles-components-dropdowns': 'Dropdowns',
    'styles-components-icons': 'Icons',
    'styles-components-modals': 'Modals',
    'styles-components-panels': 'Panels'
  }
};

class StylesPage extends mixin(TabsMixin) {
  constructor() {
    super();

    this.state = {};
    this.tabs_tabs = {};
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
    let topLevelTab = currentTab.split('-').slice(0, 2).join('-') + '-tab';

    this.tabs_tabs = STYLES_SUB_TABS[topLevelTab];

    this.setState({currentTab});
  }

  getRoutedItem(tab) {
    return (
      <Link
        to={tab}
        className="tab-item-label flush">
        {STYLES_TABS[tab]}
      </Link>
    );
  }

  getNavigation() {
    let routes = this.context.router.getCurrentRoutes();
    let currentRoute = routes[routes.length - 2].name;

    return (
      <ul className="menu-tabbed">
        {TabsUtil.getTabs(
          STYLES_TABS,
          currentRoute,
          this.getRoutedItem
        )}
      </ul>
    );
  }

  getSubNavigation() {
    return (
      <ul className="menu-tabbed">
        {this.tabs_getRoutedTabs()}
      </ul>
    );
  }

  render() {
    return (
      <Page
        title="Styles"
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

StylesPage.contextTypes = {
  router: React.PropTypes.func
};

StylesPage.routeConfig = {
  label: 'Styles',
  icon: 'styles',
  matches: /^\/styles/
};

module.exports = StylesPage;
