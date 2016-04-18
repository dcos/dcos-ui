import {Store} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import ConfigActions from '../events/ConfigActions';
import EventTypes from '../constants/EventTypes';
import GetSetMixin from '../mixins/GetSetMixin';

var ConfigStore = Store.createStore({
  storeID: 'config',

  mixins: [GetSetMixin],

  getSet_data: {
    config: null
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  processStateSuccess: function (config) {
    this.set({config});
    this.emit(EventTypes.CONFIG_LOADED);
  },

  processStateError: function () {
    this.emit(EventTypes.CONFIG_ERROR);
  },

  fetchConfig: ConfigActions.fetchConfig,

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== ActionTypes.SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case ActionTypes.REQUEST_CONFIG_SUCCESS:
        ConfigStore.processStateSuccess(action.data);
        break;
      case ActionTypes.REQUEST_CONFIG_ERROR:
        ConfigStore.processStateError();
        break;
    }

    return true;
  })
});

module.exports = ConfigStore;
