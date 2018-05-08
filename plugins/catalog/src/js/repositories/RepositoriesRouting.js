import React from "react";
import { Route } from "react-router";
import { decorate, injectable } from "inversify";
import RepositoriesTab from "./RepositoriesTab";

class RepositoriesRouting {
  getRoutes(_partialNextState) {
    return [
      <Route path="/settings/repositories" component={RepositoriesTab} />
    ];
  }
}
decorate(injectable(), RepositoriesRouting);

export default RepositoriesRouting;
