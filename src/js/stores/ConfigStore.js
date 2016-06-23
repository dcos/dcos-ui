import GetSetBaseStore from './GetSetBaseStore';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import ConfigActions from '../events/ConfigActions';
import EventTypes from '../constants/EventTypes';

class ConfigStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      ccid: {},
      config: null
    };

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== ActionTypes.SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case ActionTypes.REQUEST_CONFIG_SUCCESS:
          this.processConfigSuccess(action.data);
          break;
        case ActionTypes.REQUEST_CONFIG_ERROR:
          this.emit(EventTypes.CONFIG_ERROR);
          break;
        case ActionTypes.REQUEST_CLUSTER_CCID_SUCCESS:
          this.processCCIDSuccess(action.data);
          break;
        case ActionTypes.REQUEST_CLUSTER_CCID_ERROR:
          this.emit(EventTypes.CLUSTER_CCID_ERROR);
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

  processConfigSuccess(config) {
    this.set({config});
    this.emit(EventTypes.CONFIG_LOADED);
  }

  processCCIDSuccess(ccid) {
    this.set({ccid});
    this.emit(EventTypes.CLUSTER_CCID_SUCCESS);
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
