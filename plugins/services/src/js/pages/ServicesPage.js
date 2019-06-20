import { i18nMark } from "@lingui/react";
import React from "react";
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Icon } from "@dcos/ui-kit";
import mixin from "reactjs-mixin";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import RouterUtil from "#SRC/js/utils/RouterUtil";
import TabsMixin from "#SRC/js/mixins/TabsMixin";

import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";

class ServicesPage extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);
    this.state = this.getInitialState();
  }

  componentWillMount() {
    this.store_listeners = [
      { name: "notification", events: ["change"], suppressUpdate: true }
    ];
    this.tabs_tabs = {
      "/services/overview": i18nMark("Services")
    };
    this.updateCurrentTab();
  }

  componentDidMount() {
    CosmosPackagesStore.fetchAvailablePackages();
  }

  componentDidUpdate() {
    this.updateCurrentTab();
  }

  getInitialState() {
    return {
      currentTab: "/services/overview"
    };
  }

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
  }

  getNavigation() {
    if (RouterUtil.shouldHideNavigation(this.props.routes)) {
      return null;
    }

    return <ul className="menu-tabbed">{this.tabs_getRoutedTabs()}</ul>;
  }

  render() {
    return this.props.children;
  }
}

ServicesPage.contextTypes = {
  router: routerShape
};

ServicesPage.routeConfig = {
  label: i18nMark("Services"),
  icon: <Icon shape={ProductIcons.ServicesInverse} size={iconSizeS} />,
  matches: /^\/services/
};

module.exports = ServicesPage;
