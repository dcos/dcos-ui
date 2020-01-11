import PluginSDK from "PluginSDK";

import AppDispatcher from "../events/AppDispatcher";
import {
  VIRTUAL_NETWORKS_CHANGE,
  VIRTUAL_NETWORKS_REQUEST_ERROR
} from "../constants/EventTypes";
import {
  REQUEST_VIRTUAL_NETWORKS_SUCCESS,
  REQUEST_VIRTUAL_NETWORKS_ERROR,
  SERVER_ACTION
} from "../constants/ActionTypes";
import BaseStore from "./BaseStore";
import { Overlay } from "../structs/Overlay";
import VirtualNetworksActions from "../events/VirtualNetworksActions";

class VirtualNetworksStore extends BaseStore {
  overlays: Overlay[];

  storeID = "virtualNetworks";
  fetch = VirtualNetworksActions.fetch;

  constructor() {
    super();

    this.overlays = [];

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: VIRTUAL_NETWORKS_CHANGE,
        error: VIRTUAL_NETWORKS_REQUEST_ERROR
      },
      unmountWhen: () => true,
      listenAlways: true
    });

    // Handle app actions
    AppDispatcher.register(({ source, action }) => {
      if (source !== SERVER_ACTION) {
        return;
      }
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

  getOverlays = () => this.overlays;

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
