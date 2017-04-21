import {
  REQUEST_SIDEBAR_OPEN,
  REQUEST_SIDEBAR_CLOSE,
  REQUEST_SIDEBAR_DOCK,
  REQUEST_SIDEBAR_UNDOCK,
  REQUEST_CLI_INSTRUCTIONS,
  REQUEST_SIDEBAR_WIDTH_CHANGE
} from "../constants/ActionTypes";

import AppDispatcher from "./AppDispatcher";

module.exports = {
  open() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_OPEN,
      data: true
    });
  },

  close() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_CLOSE,
      data: false
    });
  },

  dock() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_DOCK,
      data: true
    });
  },

  undock() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_UNDOCK,
      data: false
    });
  },

  openCliInstructions() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_CLI_INSTRUCTIONS,
      data: false
    });
  },

  sidebarWidthChange() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_WIDTH_CHANGE
    });
  }
};
