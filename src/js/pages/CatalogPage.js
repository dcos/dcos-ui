import { i18nMark } from "@lingui/react";
import React from "react";

import Icon from "../components/Icon";

class CatalogPage extends React.Component {
  render() {
    return this.props.children;
  }
}

CatalogPage.routeConfig = {
  label: i18nMark("Catalog"),
  icon: <Icon id="catalog-inverse" size="small" family="product" />,
  matches: /^\/catalog/
};

module.exports = CatalogPage;
