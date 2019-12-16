import { i18nMark } from "@lingui/react";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const SystemOverviewPage = ({ children }) => {
  return children;
};

SystemOverviewPage.routeConfig = {
  label: i18nMark("Cluster"),
  icon: <Icon shape={ProductIcons.ClusterInverse} size={iconSizeS} />,
  matches: /^\/cluster/
};

export default SystemOverviewPage;
