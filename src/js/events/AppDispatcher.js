import { Dispatcher } from "flux";

import ActionTypes from "../constants/ActionTypes";

var AppDispatcher = Object.assign(new Dispatcher(), {
  handleServerAction(action) {
    if (!action.type) {
      console.warn("Empty action.type: you likely mistyped the action.");
    }

    this.dispatch({
      source: ActionTypes.SERVER_ACTION,
      action
    });
  },

  handleSidebarAction(action) {
    if (!action.type) {
      console.warn("Empty action.type: you likely mistyped the action.");
    }

    this.dispatch({
      source: ActionTypes.SIDEBAR_ACTION,
      action
    });
  }
});

module.exports = AppDispatcher;
