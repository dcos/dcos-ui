import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import PluginSDK from "PluginSDK";

import MesosSummaryStore from "../stores/MesosSummaryStore";

const { Hooks } = PluginSDK;

class ClusterName extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "summary",
        events: ["success"],
        listenAlways: false
      }
    ];
  }

  render() {
    const states = MesosSummaryStore.get("states");
    let clusterName = "";

    if (states) {
      const lastState = states.lastSuccessful();

      if (lastState) {
        clusterName = lastState.getClusterName();
      }
    }

    clusterName = Hooks.applyFilter("clusterName", clusterName);

    return (
      <h5
        className="header-title inverse text-overflow flush"
        title={clusterName}
      >
        {clusterName}
      </h5>
    );
  }
}

module.exports = ClusterName;
