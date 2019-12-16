import { i18nMark } from "@lingui/react";
import * as React from "react";
import { routerShape } from "react-router";
import { Icon } from "@dcos/ui-kit";
import mixin from "reactjs-mixin";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import RouterUtil from "#SRC/js/utils/RouterUtil";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

class ServicesPage extends mixin(StoreMixin) {
  public static contextTypes = {
    router: routerShape
  };

  public static routeConfig = {
    label: i18nMark("Services"),
    icon: <Icon shape={ProductIcons.ServicesInverse} size={iconSizeS} />,
    matches: /^\/services/
  };

  public store_listeners: Array<{
    name: string;
    events: string[];
    suppressUpdate: boolean;
  }>;

  constructor() {
    super(...arguments);
    this.store_listeners = [
      { name: "notification", events: ["change"], suppressUpdate: true }
    ];
  }

  public componentDidMount() {
    CosmosPackagesStore.fetchAvailablePackages();
  }

  public getNavigation() {
    if (RouterUtil.shouldHideNavigation(this.props.routes)) {
      return null;
    }

    return <ul className="menu-tabbed">{this.tabs_getRoutedTabs()}</ul>;
  }

  public render() {
    return this.props.children;
  }
}

export default ServicesPage;
