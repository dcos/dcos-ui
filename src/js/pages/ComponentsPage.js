import { i18nMark } from "@lingui/react";
import React from "react";

import Icon from "../components/Icon";

class ComponentsPage extends React.Component {
  render() {
    return this.props.children;
  }
}

ComponentsPage.routeConfig = {
  label: i18nMark("Components"),
  icon: <Icon id="components-inverse" size="small" family="product" />,
  matches: /^\/components/
};

module.exports = ComponentsPage;
