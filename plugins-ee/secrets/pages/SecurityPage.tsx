import * as React from "react";
import { i18nMark } from "@lingui/react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

class SecurityPage extends React.Component {
  static routeConfig = {
    label: i18nMark("Secrets"),
    icon: <Icon shape={ProductIcons.LockInverse} size={iconSizeS} />,
    matches: /^\/secrets/
  };
  render() {
    return this.props.children;
  }
}

module.exports = SecurityPage;
