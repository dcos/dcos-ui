import BaseStore from "#SRC/js/stores/BaseStore";
import {
  NETWORKING_NODE_MEMBERSHIP_CHANGE,
  NETWORKING_NODE_MEMBERSHIP_REQUEST_ERROR,
} from "../constants/EventTypes";

import {
  REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
  REQUEST_NETWORKING_NODE_MEMBERSHIPS_ERROR,
} from "../constants/ActionTypes";

import NetworkingActions from "../actions/NetworkingActions";

const SDK = require("../../../SDK");

class NetworkingNodeMembershipsStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "networkingNodeMemberships",
      events: {
        success: NETWORKING_NODE_MEMBERSHIP_CHANGE,
        error: NETWORKING_NODE_MEMBERSHIP_REQUEST_ERROR,
      },
      unmountWhen: () => false,
    });

    SDK.getSDK().onDispatch((action) => {
      switch (action.type) {
        case REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS:
          this.processNodeMemberships(action.data);
          break;
        case REQUEST_NETWORKING_NODE_MEMBERSHIPS_ERROR:
          this.processNodeMembershipsError(action.data);
          break;
      }
    });
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState().internalLoadBalancing[prop];
  }

  fetchNodeMemberships(...args) {
    return NetworkingActions.fetchNodeMemberships(...args);
  }

  processNodeMemberships(nodeMemberships) {
    SDK.getSDK().dispatch({
      type: NETWORKING_NODE_MEMBERSHIP_CHANGE,
      nodeMemberships,
    });
    this.emit(NETWORKING_NODE_MEMBERSHIP_CHANGE);
  }

  processNodeMembershipsError(error) {
    this.emit(NETWORKING_NODE_MEMBERSHIP_REQUEST_ERROR, error);
  }
}

export default new NetworkingNodeMembershipsStore();
