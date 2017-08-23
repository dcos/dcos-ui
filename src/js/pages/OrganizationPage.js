/* @flow */
import React from "react";

import Icon from "../components/Icon";

type Props = {};

class OrganizationPage extends React.Component {

  render() {
    return this.props.children;
  }
}

OrganizationPage.routeConfig = {
  label: "Organization",
  icon: <Icon id="users-inverse" size="small" family="product" />,
  matches: /^\/organization/
};

module.exports = OrganizationPage;
