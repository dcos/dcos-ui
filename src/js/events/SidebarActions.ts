import {
  REQUEST_CLI_INSTRUCTIONS,
  REQUEST_CLUSTER_LINKING,
  REQUEST_SIDEBAR_WIDTH_CHANGE,
  REQUEST_SIDEBAR_TOGGLE,
  REQUEST_SIDEBAR_CLOSE,
  REQUEST_SIDEBAR_OPEN,
} from "../constants/ActionTypes";

import AppDispatcher from "./AppDispatcher";

const dispatch = (action) => AppDispatcher.dispatch({ action });
export default {
  open() {
    dispatch({ type: REQUEST_SIDEBAR_OPEN, isVisible: true });
  },
  close() {
    dispatch({ type: REQUEST_SIDEBAR_CLOSE, isVisible: false });
  },
  toggle() {
    dispatch({ type: REQUEST_SIDEBAR_TOGGLE });
  },
  openCliInstructions() {
    dispatch({ type: REQUEST_CLI_INSTRUCTIONS, data: false });
  },
  openClusterLinkingModal() {
    dispatch({ type: REQUEST_CLUSTER_LINKING, data: false });
  },
  sidebarWidthChange() {
    dispatch({ type: REQUEST_SIDEBAR_WIDTH_CHANGE });
  },
};
