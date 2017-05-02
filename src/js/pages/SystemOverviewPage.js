import React from "react";

import Icon from "../components/Icon";

class SystemOverviewPage extends React.Component {
  render() {
    return this.props.children;
  }
}

SystemOverviewPage.routeConfig = {
  label: "Overview",
  icon: <Icon id="cluster-inverse" size="small" family="product" />,
  matches: /^\/overview/
};

module.exports = SystemOverviewPage;
