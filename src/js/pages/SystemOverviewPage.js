import { i18nMark } from "@lingui/react";
import React from "react";

import Icon from "../components/Icon";

class SystemOverviewPage extends React.Component {
  render() {
    return this.props.children;
  }
}

SystemOverviewPage.routeConfig = {
  label: i18nMark("Cluster"),
  icon: <Icon id="cluster-inverse" size="small" family="product" />,
  matches: /^\/cluster/
};

module.exports = SystemOverviewPage;
