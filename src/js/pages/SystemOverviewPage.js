import React from "react";

import Icon from "../components/Icon";

class SystemOverviewPage extends React.Component {
  render() {
    return this.props.children;
  }
}

SystemOverviewPage.routeConfig = {
  label: "System Overview",
  icon: <Icon id="cluster-inverse" size="small" family="product" />,
  matches: /^\/system-overview/
};

module.exports = SystemOverviewPage;
