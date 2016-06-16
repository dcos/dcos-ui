import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_SUMMARY_HISTORY_SUCCESS,
  REQUEST_MESOS_HISTORY_ONGOING,
  REQUEST_SUMMARY_SUCCESS,
  REQUEST_SUMMARY_ERROR,
  REQUEST_SUMMARY_ONGOING
} from '../constants/ActionTypes';
var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');
import {Hooks} from 'PluginSDK';
var TimeScales = require('../constants/TimeScales');

var _historyServiceOnline = true;

function testHistoryServerResponse(response) {
  // If the response is an empty object, that means something is whack
  // Fall back to making requests to Mesos
  if (response === {}) {
    _historyServiceOnline = false;
  }
}

function testHistoryOnline() {
  RequestUtil.json({
    url: `${Config.historyServer}/dcos-history-service/history/last`,
    success: function (response) {
      _historyServiceOnline = true;
      testHistoryServerResponse(response);
    },
    error: function () {
      setTimeout(testHistoryOnline, Config.testHistoryInterval);
    }
  });
}

function requestFromHistoryServer(resolve, reject, timeScale = 'last') {
  let url = `${Config.historyServer}/dcos-history-service/history/${timeScale}`;
  let successEventType = REQUEST_SUMMARY_SUCCESS;

  if (timeScale === TimeScales.MINUTE) {
    successEventType = REQUEST_SUMMARY_HISTORY_SUCCESS;
  }

  RequestUtil.json({
    url,
    success: function (response) {
      testHistoryServerResponse(response);
      AppDispatcher.handleServerAction({
        type: successEventType,
        data: response
      });
      resolve();
    },
    error: function () {
      _historyServiceOnline = false;

      setTimeout(testHistoryOnline, Config.testHistoryInterval);
      // Immediately fall back on state-summary
      requestFromMesos(resolve, reject);
    },
    hangingRequestCallback: function () {
      AppDispatcher.handleServerAction({type: REQUEST_MESOS_HISTORY_ONGOING});
    }
  });
}

function requestFromMesos(resolve, reject) {
  RequestUtil.json({
    url: `${Config.rootUrl}/mesos/master/state-summary`,
    success: function (response) {
      AppDispatcher.handleServerAction({
        type: REQUEST_SUMMARY_SUCCESS,
        data: response
      });
      resolve();
    },
    error: function (e) {
      AppDispatcher.handleServerAction({
        type: REQUEST_SUMMARY_ERROR,
        data: e.message
      });
      reject();
    },
    hangingRequestCallback: function () {
      AppDispatcher.handleServerAction({type: REQUEST_SUMMARY_ONGOING});
    }
  });
}

var MesosSummaryActions = {

  fetchSummary: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {

      return function (timeScale) {
        let canAccessHistoryServer = Hooks.applyFilter(
          'hasCapability', false, 'historyServiceAPI'
        );

        if (!_historyServiceOnline || !canAccessHistoryServer) {
          requestFromMesos(resolve, reject);
        } else {
          requestFromHistoryServer(resolve, reject, timeScale);
        }
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  )

};

module.exports = MesosSummaryActions;
