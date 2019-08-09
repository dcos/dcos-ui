import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { Helmet } from "react-helmet";

class SettingsPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>{i18nMark("Settings")}</title>
        </Helmet>
        {this.props.children}
      </React.Fragment>
    );
  }
}

SettingsPage.routeConfig = {
  label: i18nMark("Settings"),
  icon: <Icon shape={ProductIcons.GearInverse} size={iconSizeS} />,
  matches: /^\/settings/
};

module.exports = SettingsPage;
