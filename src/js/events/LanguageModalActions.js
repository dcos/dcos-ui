import {
  REQUEST_LANGUAGE_MODAL_OPEN,
  REQUEST_LANGUAGE_MODAL_CLOSE
} from "../constants/ActionTypes";

import AppDispatcher from "./AppDispatcher";

export default {
  open() {
    AppDispatcher.handleLanguageModalAction({
      type: REQUEST_LANGUAGE_MODAL_OPEN,
      isVisible: true
    });
  },

  close() {
    AppDispatcher.handleLanguageModalAction({
      type: REQUEST_LANGUAGE_MODAL_CLOSE,
      isVisible: false
    });
  }
};
