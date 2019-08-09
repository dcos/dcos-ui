import { i18nMark } from "@lingui/react";
import React from "react";
import { routerShape } from "react-router";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { Helmet } from "react-helmet";

import SidebarActions from "../events/SidebarActions";

class JobsPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>{i18nMark("Jobs")}</title>
        </Helmet>
        {this.props.children}
      </React.Fragment>
    );
  }
}

JobsPage.contextTypes = {
  router: routerShape
};

JobsPage.routeConfig = {
  label: i18nMark("Jobs"),
  icon: <Icon shape={ProductIcons.JobsInverse} size={iconSizeS} />,
  matches: /^\/jobs/
};

JobsPage.willTransitionTo = function() {
  SidebarActions.close();
};

module.exports = JobsPage;
