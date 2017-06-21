import PluginSDK from "PluginSDK";

import {
  REQUEST_CLI_INSTRUCTIONS,
  REQUEST_SIDEBAR_CLOSE,
  REQUEST_SIDEBAR_OPEN,
  REQUEST_SIDEBAR_DOCK,
  REQUEST_SIDEBAR_UNDOCK,
  REQUEST_SIDEBAR_WIDTH_CHANGE,
  REQUEST_VERSIONS_ERROR,
  REQUEST_VERSIONS_SUCCESS,
  SIDEBAR_ACTION
} from "../constants/ActionTypes";
import {
  SHOW_CLI_INSTRUCTIONS,
  SHOW_VERSIONS_ERROR,
  SHOW_VERSIONS_SUCCESS,
  SIDEBAR_CHANGE,
  SIDEBAR_WIDTH_CHANGE
} from "../constants/EventTypes";
import { SAVED_STATE_KEY } from "../constants/UserSettings";

import AppDispatcher from "../events/AppDispatcher";
import GetSetBaseStore from "./GetSetBaseStore";
import UserSettingsStore from "../stores/UserSettingsStore";
import Util from "../utils/Util";

class SidebarStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        widthChange: SIDEBAR_WIDTH_CHANGE
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      var source = payload.source;
      if (source !== SIDEBAR_ACTION) {
        return false;
      }

      var action = payload.action;

      switch (action.type) {
        case REQUEST_SIDEBAR_DOCK:
        case REQUEST_SIDEBAR_UNDOCK:
          var nextDockedState = action.data;

          if (this.get("isDocked") !== nextDockedState) {
            const savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY) || {};

            this.set({
              isVisible: nextDockedState ? false : nextDockedState,
              isDocked: nextDockedState
            });

            this.emitChange(SIDEBAR_CHANGE);

            savedStates.sidebar = { isDocked: nextDockedState };
            UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);
          }
          break;
        case REQUEST_SIDEBAR_CLOSE:
        case REQUEST_SIDEBAR_OPEN:
          var oldisVisible = this.get("isVisible");
          var isVisible = action.data;

          // only emitting on change
          if (oldisVisible !== isVisible) {
            this.set({ isVisible });
            this.emitChange(SIDEBAR_CHANGE);
          }
          break;
        case REQUEST_CLI_INSTRUCTIONS:
          this.emitChange(SHOW_CLI_INSTRUCTIONS);
          break;
        case REQUEST_VERSIONS_SUCCESS:
          this.set({ versions: action.data });
          this.emitChange(SHOW_VERSIONS_SUCCESS);
          break;
        case REQUEST_VERSIONS_ERROR:
          this.emitChange(SHOW_VERSIONS_ERROR);
          break;
        case REQUEST_SIDEBAR_WIDTH_CHANGE:
          this.emitChange(SIDEBAR_WIDTH_CHANGE);
          break;
      }

      return true;
    });
  }

  init() {
    let isDocked = Util.findNestedPropertyInObject(
      UserSettingsStore.getKey(SAVED_STATE_KEY),
      "sidebar.isDocked"
    );

    if (isDocked == null) {
      isDocked = true;
    }

    this.set({
      isDocked,
      isVisible: false,
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
    return "sidebar";
  }
}

const store = new SidebarStore();
store.setMaxListeners(1000);

module.exports = store;
