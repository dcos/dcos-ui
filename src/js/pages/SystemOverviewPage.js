import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { Helmet } from "react-helmet";

class SystemOverviewPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>{i18nMark("Cluster")}</title>
        </Helmet>
        {this.props.children}
      </React.Fragment>
    );
  }
}

SystemOverviewPage.routeConfig = {
  label: i18nMark("Cluster"),
  icon: <Icon shape={ProductIcons.ClusterInverse} size={iconSizeS} />,
  matches: /^\/cluster/
};

module.exports = SystemOverviewPage;
