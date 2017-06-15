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
import OverlayList from "../structs/OverlayList";
import VirtualNetworksActions from "../events/VirtualNetworksActions";

let fetchInterval = null;

class VirtualNetworksStore extends BaseStore {
  constructor() {
    super(...arguments);

    this.data = { overlays: [] };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: VIRTUAL_NETWORKS_CHANGE,
        error: VIRTUAL_NETWORKS_REQUEST_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    // Handle app actions
    this.dispatcherIndex = AppDispatcher.register(({ source, action }) => {
      if (source !== SERVER_ACTION) {
        return false;
      }
      switch (action.type) {
        case REQUEST_VIRTUAL_NETWORKS_SUCCESS:
          this.processVirtualNetworks(action.data);
          break;
        case REQUEST_VIRTUAL_NETWORKS_ERROR:
          this.processVirtualNetworksError(action.data);
          break;
      }
    });
  }

  addChangeListener(eventName, callback) {
    super.addChangeListener(eventName, callback);

    // Start polling if there is at least one listener
    if (this.shouldPoll()) {
      this.startPolling();
    }
  }

  removeChangeListener(eventName, callback) {
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

    fetchInterval = global.setInterval(
      VirtualNetworksActions.fetch,
      Config.getRefreshRate()
    );
  }

  stopPolling() {
    if (fetchInterval) {
      global.clearInterval(fetchInterval);
      fetchInterval = null;
    }
  }

  getOverlays() {
    return new OverlayList({ items: this.data.overlays });
  }

  fetch() {
    return VirtualNetworksActions.fetch(...arguments);
  }

  processVirtualNetworks({ overlays, vtep_mac_oui, vtep_subnet } = {}) {
    this.data.overlays = overlays || [];
    this.data.vtep_mac_oui = vtep_mac_oui;
    this.data.vtep_subnet = vtep_subnet;
    this.emit(VIRTUAL_NETWORKS_CHANGE);
  }

  processVirtualNetworksError(error) {
    this.emit(VIRTUAL_NETWORKS_REQUEST_ERROR, error);
  }

  get storeID() {
    return "virtualNetworks";
  }
}

module.exports = new VirtualNetworksStore();
