import PluginSDK from "PluginSDK";

import AppDispatcher from "../events/AppDispatcher";
import {
  VIRTUAL_NETWORKS_CHANGE,
  VIRTUAL_NETWORKS_REQUEST_ERROR,
} from "../constants/EventTypes";
import {
  REQUEST_VIRTUAL_NETWORKS_SUCCESS,
  REQUEST_VIRTUAL_NETWORKS_ERROR,
} from "../constants/ActionTypes";
import BaseStore from "./BaseStore";
import { Overlay } from "../structs/Overlay";
import VirtualNetworksActions from "../events/VirtualNetworksActions";

class VirtualNetworksStore extends BaseStore {
  storeID = "virtualNetworks";
  fetch = VirtualNetworksActions.fetch;
  overlays: Overlay[] = [];

  constructor() {
    super();

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: VIRTUAL_NETWORKS_CHANGE,
        error: VIRTUAL_NETWORKS_REQUEST_ERROR,
      },
      unmountWhen: () => false,
    });

    // Handle app actions
    AppDispatcher.register(({ action }) => {
      switch (action.type) {
        case REQUEST_VIRTUAL_NETWORKS_SUCCESS:
          this.overlays = action.data.map(Overlay.from);
          this.emit(VIRTUAL_NETWORKS_CHANGE, this.overlays);

          break;
        case REQUEST_VIRTUAL_NETWORKS_ERROR:
          this.emit(VIRTUAL_NETWORKS_REQUEST_ERROR, action.data);
          break;
      }
    });
  }

  addChangeListener(eventName: string, callback: () => void) {
    super.addChangeListener(eventName, callback);

    if (this.listeners(VIRTUAL_NETWORKS_CHANGE).length === 1) {
      VirtualNetworksActions.fetch();
    }
  }

  removeChangeListener(eventName: string, callback: () => void) {
    super.removeChangeListener(eventName, callback);
  }
}

export default new VirtualNetworksStore();
