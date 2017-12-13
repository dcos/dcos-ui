import React from "react";

import Icon from "../components/Icon";

class OrganizationPage extends React.Component {
  render() {
    return this.props.children;
  }
}

OrganizationPage.routeConfig = {
  label: "Organization",
  icon: <Icon id="organization-inverse" size="small" family="product" />,
  matches: /^\/organization/
};

module.exports = OrganizationPage;
