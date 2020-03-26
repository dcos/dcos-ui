import BaseStore from "#SRC/js/stores/BaseStore";

import {
  REQUEST_BOOTSTRAP_CONFIG_ERROR,
  REQUEST_BOOTSTRAP_CONFIG_SUCCESS,
} from "../constants/ActionTypes";
import {
  BOOTSTRAP_CONFIG_ERROR,
  BOOTSTRAP_CONFIG_SUCCESS,
} from "../constants/EventTypes";
import BootstrapConfigActions from "../events/BootstrapConfigActions";

const SDK = require("../SDK");

class BootstrapConfigStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "bootstrapConfig",
      events: {
        bootstrapSuccess: BOOTSTRAP_CONFIG_SUCCESS,
        bootstrapError: BOOTSTRAP_CONFIG_ERROR,
      },
      unmountWhen: () => false,
    });

    SDK.getSDK().onDispatch((action) => {
      switch (action.type) {
        case REQUEST_BOOTSTRAP_CONFIG_SUCCESS:
          this.processBootstrapConfig(action.data);
          break;
        case REQUEST_BOOTSTRAP_CONFIG_ERROR:
          this.emit(BOOTSTRAP_CONFIG_ERROR);
          break;
      }
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  fetchBootstrapConfig(...args) {
    return BootstrapConfigActions.fetchBootstrapConfig(...args);
  }

  getSecurityMode() {
    return this.get("security");
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState()[prop];
  }

  processBootstrapConfig(bootstrapConfig) {
    SDK.getSDK().dispatch({
      type: BOOTSTRAP_CONFIG_SUCCESS,
      bootstrapConfig,
    });

    this.emit(BOOTSTRAP_CONFIG_SUCCESS);
  }
}

export default new BootstrapConfigStore();
