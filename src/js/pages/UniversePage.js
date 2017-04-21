import React from "react";

import Icon from "../components/Icon";

class UniversePage extends React.Component {
  render() {
    return this.props.children;
  }
}

UniversePage.routeConfig = {
  label: "Universe",
  icon: <Icon id="packages-inverse" size="small" family="product" />,
  matches: /^\/universe/
};

module.exports = UniversePage;
