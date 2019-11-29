import {
  REQUEST_CLI_INSTRUCTIONS,
  REQUEST_CLUSTER_LINKING,
  REQUEST_SIDEBAR_WIDTH_CHANGE,
  REQUEST_SIDEBAR_TOGGLE,
  REQUEST_SIDEBAR_CLOSE,
  REQUEST_SIDEBAR_OPEN
} from "../constants/ActionTypes";

import AppDispatcher from "./AppDispatcher";

export default {
  open() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_OPEN,
      isVisible: true
    });
  },

  close() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_CLOSE,
      isVisible: false
    });
  },

  toggle() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_TOGGLE
    });
  },

  openCliInstructions() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_CLI_INSTRUCTIONS,
      data: false
    });
  },

  openClusterLinkingModal() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_CLUSTER_LINKING,
      data: false
    });
  },

  sidebarWidthChange() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_WIDTH_CHANGE
    });
  }
};
