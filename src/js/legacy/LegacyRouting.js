import { decorate, injectable } from "inversify";

// import React from "react";
// import { Redirect, Route } from "react-router";

class LegacyRouting {
  getRoutes(_partialNextState) {
    return [];
  }
}
decorate(injectable(), LegacyRouting);

export default LegacyRouting;
