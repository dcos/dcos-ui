import { i18nMark } from "@lingui/react";
import React from "react";

import Icon from "../components/Icon";

class OrganizationPage extends React.Component {
  render() {
    return this.props.children;
  }
}

OrganizationPage.routeConfig = {
  label: i18nMark("Organization"),
  icon: <Icon id="organization-inverse" size="small" family="product" />,
  matches: /^\/organization/
};

module.exports = OrganizationPage;
