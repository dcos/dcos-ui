import {
  REQUEST_LANGUAGE_MODAL_OPEN,
  REQUEST_LANGUAGE_MODAL_CLOSE,
} from "../constants/ActionTypes";

import AppDispatcher from "./AppDispatcher";

const dispatch = (action) => AppDispatcher.dispatch({ action });
export default {
  open() {
    dispatch({ type: REQUEST_LANGUAGE_MODAL_OPEN, isVisible: true });
  },

  close() {
    dispatch({ type: REQUEST_LANGUAGE_MODAL_CLOSE, isVisible: false });
  },
};
