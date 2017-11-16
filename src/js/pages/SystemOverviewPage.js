import React from "react";

import Icon from "../components/Icon";

class SystemOverviewPage extends React.Component {
  render() {
    return this.props.children;
  }
}

SystemOverviewPage.routeConfig = {
  label: "Cluster",
  icon: <Icon id="cluster-inverse" size="small" family="product" />,
  matches: /^\/cluster/
};

module.exports = SystemOverviewPage;
