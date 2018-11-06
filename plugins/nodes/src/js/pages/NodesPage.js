import { i18nMark } from "@lingui/react";
import React from "react";

import Icon from "#SRC/js/components/Icon";

class NodesPage extends React.Component {
  render() {
    return this.props.children;
  }
}

NodesPage.routeConfig = {
  label: i18nMark("Nodes"),
  icon: <Icon id="nodes-inverse" size="small" family="product" />,
  matches: /^\/nodes/
};

module.exports = NodesPage;
