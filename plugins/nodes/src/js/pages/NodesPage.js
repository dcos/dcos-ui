/* @flow */
import React from "react";

import Icon from "#SRC/js/components/Icon";

type Props = {};

class NodesPage extends React.Component {

  render() {
    return this.props.children;
  }
}

NodesPage.routeConfig = {
  label: "Nodes",
  icon: <Icon id="servers-inverse" size="small" family="product" />,
  matches: /^\/nodes/
};

module.exports = NodesPage;
