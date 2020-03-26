import PluginSDK from "PluginSDK";

import {
  REQUEST_CLI_INSTRUCTIONS,
  REQUEST_CLUSTER_LINKING,
  REQUEST_SIDEBAR_WIDTH_CHANGE,
  REQUEST_SIDEBAR_TOGGLE,
  REQUEST_SIDEBAR_CLOSE,
  REQUEST_SIDEBAR_OPEN,
} from "../constants/ActionTypes";
import {
  SHOW_CLI_INSTRUCTIONS,
  SHOW_CLUSTER_LINKING,
  SIDEBAR_CHANGE,
  SIDEBAR_WIDTH_CHANGE,
} from "../constants/EventTypes";
import { SAVED_STATE_KEY } from "../constants/UserSettings";

import AppDispatcher from "../events/AppDispatcher";
import GetSetBaseStore from "./GetSetBaseStore";
import UserSettingsStore from "../stores/UserSettingsStore";
import Util from "../utils/Util";

class SidebarStore extends GetSetBaseStore<{
  isVisible: boolean;
  versions: Record<string, unknown>;
}> {
  constructor() {
    super();

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        widthChange: SIDEBAR_WIDTH_CHANGE,
      },
      unmountWhen: () => false,
    });

    AppDispatcher.register(({ action }) => {
      switch (action.type) {
        case REQUEST_SIDEBAR_TOGGLE:
        case REQUEST_SIDEBAR_CLOSE:
        case REQUEST_SIDEBAR_OPEN:
          const savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY) || {};
          let isVisible = !this.get("isVisible");

          if (action.isVisible !== undefined) {
            isVisible = action.isVisible;
          }

          this.set({ isVisible });
          this.emitChange(SIDEBAR_CHANGE);

          savedStates.sidebar = { isVisible };
          UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);

          break;
        case REQUEST_CLI_INSTRUCTIONS:
          this.emitChange(SHOW_CLI_INSTRUCTIONS);
          break;
        case REQUEST_CLUSTER_LINKING:
          this.emitChange(SHOW_CLUSTER_LINKING);
          break;
        case REQUEST_SIDEBAR_WIDTH_CHANGE:
          this.emitChange(SIDEBAR_WIDTH_CHANGE);
          break;
      }

      return true;
    });
  }

  init() {
    let isVisible = Util.findNestedPropertyInObject(
      UserSettingsStore.getKey(SAVED_STATE_KEY),
      "sidebar.isVisible"
    );

    if (isVisible == null) {
      isVisible = true;
    }

    this.set({
      isVisible,
      versions: {},
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

export default store;
