import { decorate, injectable } from "inversify";
import React from "react";
import Icon from "#SRC/js/components/Icon";

export default class CatalogNavigation {
  getElements() {
    return [
      {
        path: "/catalog",
        link: "Catalog",
        parent: "root",
        icon: <Icon id="catalog-inverse" size="small" family="product" />
      }
    ];
  }
}
decorate(injectable(), CatalogNavigation);
