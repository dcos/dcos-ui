/* @flow */
import React from "react";

import Icon from "../components/Icon";

type Props = {};

class ComponentsPage extends React.Component {

  render() {
    return this.props.children;
  }
}

ComponentsPage.routeConfig = {
  label: "Components",
  icon: <Icon id="components-inverse" size="small" family="product" />,
  matches: /^\/components/
};

module.exports = ComponentsPage;
