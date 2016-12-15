import PluginSDK from 'PluginSDK';

import {
  REQUEST_BOOTSTRAP_CONFIG_ERROR,
  REQUEST_BOOTSTRAP_CONFIG_SUCCESS,
  REQUEST_CLUSTER_CCID_ERROR,
  REQUEST_CLUSTER_CCID_SUCCESS,
  REQUEST_CONFIG_ERROR,
  REQUEST_CONFIG_SUCCESS,
  SERVER_ACTION
} from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import ConfigActions from '../events/ConfigActions';
import {
  BOOTSTRAP_CONFIG_ERROR,
  BOOTSTRAP_CONFIG_SUCCESS,
  CLUSTER_CCID_ERROR,
  CLUSTER_CCID_SUCCESS,
  CONFIG_ERROR,
  CONFIG_LOADED
} from '../constants/EventTypes';
import GetSetBaseStore from './GetSetBaseStore';

class ConfigStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      bootstrapConfig: {},
      ccid: {},
      config: null
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: CONFIG_LOADED,
        error: CONFIG_ERROR,
        ccidSuccess: CLUSTER_CCID_SUCCESS,
        ccidError: CLUSTER_CCID_ERROR,
        bootstrapSuccess: BOOTSTRAP_CONFIG_SUCCESS,
        bootstrapError: BOOTSTRAP_CONFIG_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case REQUEST_CONFIG_SUCCESS:
          this.processConfigSuccess(action.data);
          break;
        case REQUEST_CONFIG_ERROR:
          this.emit(CONFIG_ERROR);
          break;
        case REQUEST_CLUSTER_CCID_SUCCESS:
          this.processCCIDSuccess(action.data);
          break;
        case REQUEST_CLUSTER_CCID_ERROR:
          this.emit(CLUSTER_CCID_ERROR);
          break;
        case REQUEST_BOOTSTRAP_CONFIG_SUCCESS:
          this.processBootstrapConfigSuccess(action.data);
          break;
        case REQUEST_BOOTSTRAP_CONFIG_ERROR:
          this.emit(BOOTSTRAP_CONFIG_ERROR);
          break;
      }

      return true;
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  processBootstrapConfigSuccess(bootstrapConfig) {
    this.set({bootstrapConfig});
    this.emit(BOOTSTRAP_CONFIG_SUCCESS);
  }

  processConfigSuccess(config) {
    this.set({config});
    this.emit(CONFIG_LOADED);
  }

  processCCIDSuccess(ccid) {
    this.set({ccid});
    this.emit(CLUSTER_CCID_SUCCESS);
  }

  fetchBootstrapConfig() {
    return ConfigActions.fetchBootstrapConfig(...arguments);
  }

  fetchConfig() {
    return ConfigActions.fetchConfig(...arguments);
  }

  fetchCCID() {
    return ConfigActions.fetchCCID(...arguments);
  }

  get storeID() {
    return 'config';
  }
}

module.exports = new ConfigStore();
