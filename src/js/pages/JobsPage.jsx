import { i18nMark } from "@lingui/react";
import React from "react";
import { routerShape } from "react-router";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import SidebarActions from "../events/SidebarActions";

const JobsPage = ({ children }) => {
  return children;
};

JobsPage.contextTypes = {
  router: routerShape
};

JobsPage.routeConfig = {
  label: i18nMark("Jobs"),
  icon: <Icon shape={ProductIcons.JobsInverse} size={iconSizeS} />,
  matches: /^\/jobs/
};

JobsPage.willTransitionTo = () => {
  SidebarActions.close();
};

export default JobsPage;
