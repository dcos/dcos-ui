import PluginSDK from "PluginSDK";

import {
  LANGUAGE_MODAL_ACTION,
  REQUEST_LANGUAGE_MODAL_OPEN,
  REQUEST_LANGUAGE_MODAL_CLOSE
} from "../constants/ActionTypes";
import {
  LANGUAGE_MODAL_CHANGE,
  LANGUAGE_MODAL_CLOSE
} from "../constants/EventTypes";

import AppDispatcher from "../events/AppDispatcher";
import GetSetBaseStore from "./GetSetBaseStore";

class LanguageModalStore extends GetSetBaseStore {
  constructor(...args) {
    super(...args);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      unmountWhen: () => false
    });

    AppDispatcher.register(payload => {
      var source = payload.source;
      if (source !== LANGUAGE_MODAL_ACTION) {
        return false;
      }

      var action = payload.action;

      switch (action.type) {
        case REQUEST_LANGUAGE_MODAL_OPEN:
          this.set({ isVisible: true });
          this.emit(LANGUAGE_MODAL_CHANGE);
          break;
        case REQUEST_LANGUAGE_MODAL_CLOSE:
          this.set({ isVisible: false });
          this.emit(LANGUAGE_MODAL_CHANGE);
          this.emit(LANGUAGE_MODAL_CLOSE);
          break;
      }

      return true;
    });
  }

  get storeID() {
    return "languageModal";
  }
}
module.exports = new LanguageModalStore();
