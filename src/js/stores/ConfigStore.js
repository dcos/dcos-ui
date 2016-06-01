import GetSetBaseStore from './GetSetBaseStore';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import ConfigActions from '../events/ConfigActions';
import EventTypes from '../constants/EventTypes';

class ConfigStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      config: null
    };

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== ActionTypes.SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case ActionTypes.REQUEST_CONFIG_SUCCESS:
          this.processStateSuccess(action.data);
          break;
        case ActionTypes.REQUEST_CONFIG_ERROR:
          this.processStateError();
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

  processStateSuccess(config) {
    this.set({config});
    this.emit(EventTypes.CONFIG_LOADED);
  }

  processStateError() {
    this.emit(EventTypes.CONFIG_ERROR);
  }

  fetchConfig() {
    return ConfigActions.fetchConfig(...arguments);
  }

  get storeID() {
    return 'config';
  }
}

module.exports = new ConfigStore();
