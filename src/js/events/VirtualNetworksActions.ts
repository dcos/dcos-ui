import { RequestUtil } from "mesosphere-shared-reactjs";
import {
  REQUEST_VIRTUAL_NETWORKS_SUCCESS,
  REQUEST_VIRTUAL_NETWORKS_ERROR
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import { APIResponse } from "../structs/Overlay";

const VirtualNetworksActions = {
  fetch() {
    RequestUtil.json({
      url: `${Config.rootUrl}/mesos/overlay-master/state`,
      success(response: { network: { overlays: APIResponse } }) {
        AppDispatcher.handleServerAction({
          type: REQUEST_VIRTUAL_NETWORKS_SUCCESS,
          data: response.network.overlays || []
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
  const virtualNetworksFixture = require("./__tests__/_fixtures/virtual-networks.json");

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  window.actionTypes.VirtualNetworksActions = {
    fetch: { event: "success", success: { response: virtualNetworksFixture } }
  };

  Object.keys(window.actionTypes.VirtualNetworksActions).forEach(method => {
    VirtualNetworksActions[method] = RequestUtil.stubRequest(
      VirtualNetworksActions,
      "VirtualNetworksActions",
      method
    );
  });
}

export default VirtualNetworksActions;
