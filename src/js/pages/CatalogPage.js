import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

class CatalogPage extends React.Component {
  render() {
    return this.props.children;
  }
}

CatalogPage.routeConfig = {
  label: i18nMark("Catalog"),
  icon: <Icon shape={ProductIcons.PackagesInverse} size={iconSizeS} />,
  matches: /^\/catalog/
};

export default CatalogPage;
