import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

class NodesPage extends React.Component {
  render() {
    return this.props.children;
  }
}

NodesPage.routeConfig = {
  label: i18nMark("Nodes"),
  icon: <Icon shape={ProductIcons.ServersInverse} size={iconSizeS} />,
  matches: /^\/nodes/
};

export default NodesPage;
