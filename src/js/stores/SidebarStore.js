import {Store} from 'mesosphere-shared-reactjs';

var AppDispatcher = require('../events/AppDispatcher');
import ActionTypes from '../constants/ActionTypes';
import EventTypes from '../constants/EventTypes';
var GetSetMixin = require('../mixins/GetSetMixin');

var SidebarStore = Store.createStore({
  storeID: 'sidebar',

  mixins: [GetSetMixin],

  init: function () {
    this.set({
      isOpen: false,
      versions: {}
    });
  },

  emitChange: function (eventName) {
    this.emit(eventName);
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    var source = payload.source;
    if (source !== ActionTypes.SIDEBAR_ACTION) {
      return false;
    }

    var action = payload.action;

    switch (action.type) {
      case ActionTypes.REQUEST_SIDEBAR_CLOSE:
      case ActionTypes.REQUEST_SIDEBAR_OPEN:
        var oldIsOpen = SidebarStore.get('isOpen');
        var isOpen = action.data;

        // only emitting on change
        if (oldIsOpen !== isOpen) {
          SidebarStore.set({isOpen});
          SidebarStore.emitChange(EventTypes.SIDEBAR_CHANGE);
        }
        break;
      case ActionTypes.REQUEST_CLI_INSTRUCTIONS:
        SidebarStore.emitChange(EventTypes.SHOW_CLI_INSTRUCTIONS);
        break;
      case ActionTypes.REQUEST_VERSIONS_SUCCESS:
        SidebarStore.set({versions: action.data});
        SidebarStore.emitChange(EventTypes.SHOW_VERSIONS_SUCCESS);
        break;
      case ActionTypes.REQUEST_VERSIONS_ERROR:
        SidebarStore.emitChange(EventTypes.SHOW_VERSIONS_ERROR);
        break;
    }

    return true;
  })

});

module.exports = SidebarStore;
