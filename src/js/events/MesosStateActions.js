import {RequestUtil} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');

var MesosStateActions = {

  fetchState: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        RequestUtil.json({
          url: `${Config.historyServer}/mesos/master/state`,
          success: function (response) {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MESOS_STATE_SUCCESS,
              data: response
            });
            resolve();
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MESOS_STATE_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: ActionTypes.REQUEST_MESOS_STATE_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  )

};

if (Config.useFixtures) {
  let fetchState = require('../../../scripts/logmaker/out/mesosState.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.MesosStateActions = {
    fetchState: {
      event: 'success', success: {response: fetchState}
    }
  };

  Object.keys(global.actionTypes.MesosStateActions).forEach(function (method) {
    MesosStateActions[method] = RequestUtil.stubRequest(
      MesosStateActions, 'MesosStateActions', method
    );
  });
}

module.exports = MesosStateActions;
