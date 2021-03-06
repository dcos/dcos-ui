import { i18nMark } from "@lingui/react";
import { routerShape } from "react-router";
import * as React from "react";

import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const NetworkPage = ({ children }) => children;
NetworkPage.contextTypes = { router: routerShape };
NetworkPage.routeConfig = {
  label: i18nMark("Networking"),
  icon: <Icon shape={ProductIcons.NetworkInverse} size={iconSizeS} />,
  matches: /^\/networking/,
};

export default NetworkPage;
