import PluginSDK from "PluginSDK";

import Config from "../config/Config";
import GetSetBaseStore from "./GetSetBaseStore";
import { VISIBILITY_CHANGE } from "../constants/EventTypes";

// Use visibility API to check if current tab is active or not
const Visibility = (() => {
  let stateKey;
  const keys = {
    hidden: "visibilitychange",
    webkitHidden: "webkitvisibilitychange",
    mozHidden: "mozvisibilitychange",
    msHidden: "msvisibilitychange"
  };

  // Find first key available on document
  Object.keys(keys).some(key => {
    if (key in global.document) {
      stateKey = key;

      return true;
    }

    return false;
  });

  return {
    addChangeListener(callback) {
      global.document.addEventListener(keys[stateKey], callback);
    },

    getVisibility() {
      return !global.document[stateKey];
    }
  };
})();

class VisibilityStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      isTabVisible: true,
      isInactive: false
    };

    this.timeOut = null;

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        change: VISIBILITY_CHANGE
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    // Listen for visibility change events
    Visibility.addChangeListener(() => {
      // We need setTimeout because browser hasn't yet given us the execution
      // context.
      setTimeout(this.onVisibilityChange.bind(this), 0);
    });
  }

  isTabVisible() {
    return this.get("isTabVisible");
  }

  isInactive() {
    return this.get("isInactive");
  }

  onVisibilityChange() {
    const isTabVisible = Visibility.getVisibility();

    this.set({ isTabVisible });
    this.emit(VISIBILITY_CHANGE);

    if (!this.get("isInactive") && !this.timeOut && !this.get("isTabVisible")) {
      this.timeOut = setTimeout(() => {
        this.set({ isInactive: true });
        this.emit(VISIBILITY_CHANGE);
      }, Config.setInactiveAfter || 0);
    }

    if (isTabVisible) {
      if (this.timeOut) {
        clearTimeout(this.timeOut);
        this.timeOut = null;
      }

      if (this.get("isInactive")) {
        this.set({ isInactive: false });
        this.emit(VISIBILITY_CHANGE);
      }
    }
  }

  get storeID() {
    return "visibility";
  }
}

module.exports = new VisibilityStore();
