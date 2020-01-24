import BaseStore from "#SRC/js/stores/BaseStore";
import {
  NETWORKING_BACKEND_CONNECTIONS_CHANGE,
  NETWORKING_BACKEND_CONNECTIONS_REQUEST_ERROR
} from "../constants/EventTypes";

import {
  REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS,
  REQUEST_NETWORKING_BACKEND_CONNECTIONS_ERROR,
  REQUEST_NETWORKING_BACKEND_CONNECTIONS_ONGOING
} from "../constants/ActionTypes";

import BackendConnection from "../structs/BackendConnection";
import NetworkingActions from "../actions/NetworkingActions";
import NetworkingConfig from "../../../config/NetworkingConfig";

const SDK = require("../../../SDK");

let fetchBackendConnectionsInterval = null;

class NetworkingBackendConnectionsStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "networkingBackendConnections",
      events: {
        success: NETWORKING_BACKEND_CONNECTIONS_CHANGE,
        error: NETWORKING_BACKEND_CONNECTIONS_REQUEST_ERROR
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      switch (action.type) {
        case REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS:
          this.processBackendConnections(action.vip, action.data);
          break;
        case REQUEST_NETWORKING_BACKEND_CONNECTIONS_ERROR:
          this.processBackendConnectionsError(action.vip, action.data);
          break;
        case REQUEST_NETWORKING_BACKEND_CONNECTIONS_ONGOING:
          this.handleOngoingNetworkingActionsRequest();
          break;
      }
    });
  }

  startFetchBackendConnections(protocol, vip, port) {
    if (fetchBackendConnectionsInterval) {
      return;
    }

    NetworkingActions.fetchVIPBackendConnections(protocol, vip, port);

    fetchBackendConnectionsInterval = window.setInterval(() => {
      NetworkingActions.fetchVIPBackendConnections(protocol, vip, port);
    }, NetworkingConfig.fetchInterval);
  }

  stopFetchBackendConnections() {
    if (fetchBackendConnectionsInterval) {
      window.clearInterval(fetchBackendConnectionsInterval);
      fetchBackendConnectionsInterval = null;
    }
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState().internalLoadBalancing[prop];
  }

  getBackendConnections(vipString) {
    const backendConnections = this.get("backendConnections")[vipString];

    if (backendConnections) {
      return new BackendConnection(backendConnections);
    }

    return null;
  }

  handleOngoingNetworkingActionsRequest() {
    // We could do something here
  }

  processBackendConnections(vip, backendConnections) {
    const currentBackendConnections = this.get("backendConnections");
    currentBackendConnections[vip] = backendConnections;
    SDK.getSDK().dispatch({
      type: NETWORKING_BACKEND_CONNECTIONS_CHANGE,
      backendConnections: currentBackendConnections
    });

    this.emit(NETWORKING_BACKEND_CONNECTIONS_CHANGE, vip);
  }

  processBackendConnectionsError(vip, error) {
    this.emit(NETWORKING_BACKEND_CONNECTIONS_REQUEST_ERROR, error, vip);
  }
}

export default new NetworkingBackendConnectionsStore();
