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
import Config from "../config/Config";
import { Overlay } from "../structs/Overlay";
import VirtualNetworksActions from "../events/VirtualNetworksActions";

let fetchInterval: number | null = null;

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
          this.emit(VIRTUAL_NETWORKS_CHANGE);

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

    // Start polling if there is at least one listener
    if (this.shouldPoll()) {
      this.startPolling();
    }
  }

  removeChangeListener(eventName: string, callback: () => void) {
    super.removeChangeListener(eventName, callback);

    // Stop polling if no one is listening
    if (!this.shouldPoll()) {
      this.stopPolling();
    }
  }

  shouldPoll() {
    return this.listeners(VIRTUAL_NETWORKS_CHANGE).length > 0;
  }

  startPolling() {
    if (fetchInterval) {
      return;
    }

    VirtualNetworksActions.fetch();

    fetchInterval = window.setInterval(
      VirtualNetworksActions.fetch,
      Config.getRefreshRate()
    );
  }

  stopPolling() {
    if (fetchInterval) {
      window.clearInterval(fetchInterval);
      fetchInterval = null;
    }
  }
}

export default new VirtualNetworksStore();
