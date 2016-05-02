var Dispatcher = require('flux').Dispatcher;

import ActionTypes from '../constants/ActionTypes';

var AppDispatcher = Object.assign(new Dispatcher(), {

  handleServerAction: function (action) {
    if (!action.type) {
      console.warn('Empty action.type: you likely mistyped the action.');
    }

    this.dispatch({
      source: ActionTypes.SERVER_ACTION,
      action: action
    });
  },

  handleSidebarAction: function (action) {
    if (!action.type) {
      console.warn('Empty action.type: you likely mistyped the action.');
    }

    this.dispatch({
      source: ActionTypes.SIDEBAR_ACTION,
      action: action
    });
  }

});

module.exports = AppDispatcher;
