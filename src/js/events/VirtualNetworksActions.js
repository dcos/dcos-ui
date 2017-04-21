import { RequestUtil } from "mesosphere-shared-reactjs";

import {
  REQUEST_VIRTUAL_NETWORKS_SUCCESS,
  REQUEST_VIRTUAL_NETWORKS_ERROR
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";

const VirtualNetworksActions = {
  fetch() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.virtualNetworksApi}/state`,
      success(response) {
        let { overlays, vtep_mac_oui, vtep_subnet } = response.network;
        // Map structure to mimic agents overlays
        overlays = overlays.map(function(overlay) {
          return { info: overlay };
        });

        AppDispatcher.handleServerAction({
          type: REQUEST_VIRTUAL_NETWORKS_SUCCESS,
          data: { overlays, vtep_mac_oui, vtep_subnet }
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_VIRTUAL_NETWORKS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const virtualNetworksFixture = require("../../../tests/_fixtures/networking/virtual-networks.json");

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.VirtualNetworksActions = {
    fetch: { event: "success", success: { response: virtualNetworksFixture } }
  };

  Object.keys(global.actionTypes.VirtualNetworksActions).forEach(function(
    method
  ) {
    VirtualNetworksActions[method] = RequestUtil.stubRequest(
      VirtualNetworksActions,
      "VirtualNetworksActions",
      method
    );
  });
}

module.exports = VirtualNetworksActions;
