import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { Helmet } from "react-helmet";

class ComponentsPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>{i18nMark("Components")}</title>
        </Helmet>
        {this.props.children}
      </React.Fragment>
    );
  }
}

ComponentsPage.routeConfig = {
  label: i18nMark("Components"),
  icon: <Icon shape={ProductIcons.ComponentsInverse} size={iconSizeS} />,
  matches: /^\/components/
};

module.exports = ComponentsPage;
