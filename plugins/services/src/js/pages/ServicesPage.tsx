import { i18nMark } from "@lingui/react";
import * as React from "react";
import { routerShape } from "react-router";
import { Icon } from "@dcos/ui-kit";
import mixin from "reactjs-mixin";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

export default class ServicesPage extends mixin(StoreMixin) {
  public static contextTypes = {
    router: routerShape
  };

  public static routeConfig = {
    label: i18nMark("Services"),
    icon: <Icon shape={ProductIcons.ServicesInverse} size={iconSizeS} />,
    matches: /^\/services/
  };

  constructor() {
    super(...arguments);
    this.store_listeners = [
      { name: "notification", events: ["change"], suppressUpdate: true }
    ];
  }

  public componentDidMount() {
    CosmosPackagesStore.fetchAvailablePackages();
  }

  public render() {
    return this.props.children;
  }
}
