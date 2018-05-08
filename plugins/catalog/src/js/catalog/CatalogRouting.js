import { decorate, injectable } from "inversify";
import React from "react";
import { Redirect, Route } from "react-router";

import DeployFrameworkConfiguration from "./DeployFrameworkConfiguration";
import PackageDetailTab from "./PackageDetailTab";
import PackagesTab from "./PackagesTab";
import CatalogPage from "./CatalogPage";

class CatalogRouting {
  getRoutes(_partialNextState) {
    return [
      <Redirect from="/universe" to="/catalog" />,
      <Redirect from="/catalog" to="/catalog/packages" />,
      <Route path="/catalog" component={CatalogPage}>
        <Route path="packages" component={PackagesTab} />
        <Route path=":packageName" component={PackageDetailTab} />
        <Route
          path=":packageName/deploy"
          component={DeployFrameworkConfiguration}
        />
      </Route>
    ];
  }
}
decorate(injectable(), CatalogRouting);

export default CatalogRouting;
