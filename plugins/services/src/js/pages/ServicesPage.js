import React from "react";
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import Icon from "#SRC/js/components/Icon";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import TabsMixin from "#SRC/js/mixins/TabsMixin";

import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";

var ServicesPage = React.createClass({
  contextTypes: {
    router: routerShape
  },

  mixins: [TabsMixin, StoreMixin],

  displayName: "ServicesPage",

  statics: {
    routeConfig: {
      label: "Services",
      icon: <Icon id="services-inverse" size="small" family="product" />,
      matches: /^\/services/
    }
  },

  getInitialState() {
    return {
      currentTab: "/services/overview"
    };
  },

  componentWillMount() {
    this.store_listeners = [
      { name: "notification", events: ["change"], suppressUpdate: false }
    ];
    this.tabs_tabs = {
      "/services/overview": "Services"
    };
    this.updateCurrentTab();
  },

  componentDidMount() {
    CosmosPackagesStore.fetchAvailablePackages();
  },

  componentDidUpdate() {
    this.updateCurrentTab();
  },

  updateCurrentTab() {
    let currentTab = RouterUtil.reconstructPathFromRoutes(this.props.routes);
    // `/services/overview` tab also contains routes for '/services/overview/:id'
    if (currentTab === "/services/overview/:id" || currentTab == null) {
      currentTab = "/services/overview";
    }
    // Disguise `/services/detail` tab under `/services/overview`
    // eventhough it is an actual sibling
    if (currentTab === "/services/detail/:id" || currentTab == null) {
      currentTab = "/services/overview";
    }

    if (this.state.currentTab !== currentTab) {
      this.setState({ currentTab });
    }
  },

  getNavigation() {
    if (RouterUtil.shouldHideNavigation(this.props.routes)) {
      return null;
    }

    return <ul className="menu-tabbed">{this.tabs_getRoutedTabs()}</ul>;
  },

  render() {
    return this.props.children;
  }
});

module.exports = ServicesPage;
