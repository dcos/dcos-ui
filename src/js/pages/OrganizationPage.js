import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { Helmet } from "react-helmet";

class OrganizationPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>{i18nMark("Organization")}</title>
        </Helmet>
        {this.props.children}
      </React.Fragment>
    );
  }
}

OrganizationPage.routeConfig = {
  label: i18nMark("Organization"),
  icon: <Icon shape={ProductIcons.UsersInverse} size={iconSizeS} />,
  matches: /^\/organization/
};

module.exports = OrganizationPage;
