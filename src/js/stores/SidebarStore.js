import GetSetBaseStore from './GetSetBaseStore';
import AppDispatcher from '../events/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import EventTypes from '../constants/EventTypes';

class SidebarStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      var source = payload.source;
      if (source !== ActionTypes.SIDEBAR_ACTION) {
        return false;
      }

      var action = payload.action;

      switch (action.type) {
        case ActionTypes.REQUEST_SIDEBAR_CLOSE:
        case ActionTypes.REQUEST_SIDEBAR_OPEN:
          var oldIsOpen = this.get('isOpen');
          var isOpen = action.data;

          // only emitting on change
          if (oldIsOpen !== isOpen) {
            this.set({isOpen});
            this.emitChange(EventTypes.SIDEBAR_CHANGE);
          }
          break;
        case ActionTypes.REQUEST_CLI_INSTRUCTIONS:
          this.emitChange(EventTypes.SHOW_CLI_INSTRUCTIONS);
          break;
        case ActionTypes.REQUEST_VERSIONS_SUCCESS:
          this.set({versions: action.data});
          this.emitChange(EventTypes.SHOW_VERSIONS_SUCCESS);
          break;
        case ActionTypes.REQUEST_VERSIONS_ERROR:
          this.emitChange(EventTypes.SHOW_VERSIONS_ERROR);
          break;
        case ActionTypes.SIDEBAR_WIDTH_CHANGE:
          this.emitChange(EventTypes.SIDEBAR_WIDTH_CHANGE);
          break;
      }

      return true;
    });
  }

  init() {
    this.set({
      isOpen: false,
      versions: {}
    });
  }

  // TODO: DCOS-7430 - Remove emitChange method
  emitChange(eventName) {
    this.emit(eventName);
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  get storeID() {
    return 'sidebar';
  }

}

module.exports = new SidebarStore();
