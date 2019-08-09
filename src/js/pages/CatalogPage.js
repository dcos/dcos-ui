import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { Helmet } from "react-helmet";

class CatalogPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>{i18nMark("Catalog")}</title>
        </Helmet>
        {this.props.children}
      </React.Fragment>
    );
  }
}

CatalogPage.routeConfig = {
  label: i18nMark("Catalog"),
  icon: <Icon shape={ProductIcons.PackagesInverse} size={iconSizeS} />,
  matches: /^\/catalog/
};

module.exports = CatalogPage;
