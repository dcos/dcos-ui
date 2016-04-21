import {
  REQUEST_MESOS_HISTORY_SUCCESS,
  REQUEST_MESOS_HISTORY_ONGOING,
  REQUEST_MESOS_SUMMARY_SUCCESS,
  REQUEST_MESOS_SUMMARY_ERROR,
  REQUEST_MESOS_SUMMARY_ONGOING
} from '../constants/ActionTypes';

var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');
var RequestUtil = require('../utils/RequestUtil');
var _historyServiceOnline = true;

function testHistoryOnline() {
  RequestUtil.json({
    url: `${Config.historyServer}/dcos-history-service/history/last`,
    success: function () {
      _historyServiceOnline = true;
    },
    error: function () {
      setTimeout(testHistoryOnline, Config.testHistoryInterval);
    }
  });
}

function getHistory(resolve, reject, timeScale = 'last') {
  let url = `${Config.historyServer}/dcos-history-service/history/${timeScale}`;
  let successEventType = REQUEST_MESOS_SUMMARY_SUCCESS;

  if (timeScale === 'minute') {
    successEventType = REQUEST_MESOS_HISTORY_SUCCESS;
  }

  RequestUtil.json({
    url,
    success: function (response) {
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
      getStateSummary(resolve, reject);
    },
    hangingRequestCallback: function () {
      AppDispatcher.handleServerAction({type: REQUEST_MESOS_HISTORY_ONGOING});
    }
  });
}

function getStateSummary(resolve, reject) {
  RequestUtil.json({
    url: `${Config.rootUrl}/mesos/master/state-summary`,
    success: function (response) {
      AppDispatcher.handleServerAction({
        type: REQUEST_MESOS_SUMMARY_SUCCESS,
        data: response
      });
      resolve();
    },
    error: function (e) {
      _historyServiceOnline = false;

      AppDispatcher.handleServerAction({
        type: REQUEST_MESOS_SUMMARY_ERROR,
        data: e.message
      });
      reject();
    },
    hangingRequestCallback: function () {
      AppDispatcher.handleServerAction({type: REQUEST_MESOS_SUMMARY_ONGOING});
    }
  });
}

var MesosSummaryActions = {

  fetchSummary: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {

      return function (timeScale) {
        if (!_historyServiceOnline) {
          getStateSummary(resolve, reject);
        } else {
          getHistory(resolve, reject, timeScale);
        }
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  )

};

module.exports = MesosSummaryActions;
