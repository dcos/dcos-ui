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

module.exports = MesosStateActions;
