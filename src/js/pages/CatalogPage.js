import React from "react";

import Icon from "../components/Icon";

class CatalogPage extends React.Component {
  render() {
    return this.props.children;
  }
}

CatalogPage.routeConfig = {
  label: "Catalog",
  icon: <Icon id="packages-inverse" size="small" family="product" />,
  matches: /^\/catalog/
};

module.exports = CatalogPage;
