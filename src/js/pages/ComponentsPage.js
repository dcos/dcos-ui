import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

class ComponentsPage extends React.Component {
  render() {
    return this.props.children;
  }
}

ComponentsPage.routeConfig = {
  label: i18nMark("Components"),
  icon: <Icon shape={ProductIcons.ComponentsInverse} size={iconSizeS} />,
  matches: /^\/components/
};

export default ComponentsPage;
