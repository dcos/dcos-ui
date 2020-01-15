import { RequestUtil } from "mesosphere-shared-reactjs";
import Config from "../config/Config";
import { APIResponse, Overlay } from "../structs/Overlay";

const VirtualNetworksActions = {
  fetch(onSuccess: (a: Overlay[]) => void, onError?: (a: string) => void) {
    RequestUtil.json({
      url: `${Config.rootUrl}/mesos/overlay-master/state`,
      success: (response: { network: { overlays: APIResponse[] } }) => {
        onSuccess((response.network.overlays || []).map(Overlay.from));
      },
      error: xhr => {
        onError?.(RequestUtil.getErrorFromXHR(xhr));
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
