import { RequestUtil } from "mesosphere-shared-reactjs";
import { Hooks } from "PluginSDK";

import {
  REQUEST_SUMMARY_HISTORY_SUCCESS,
  REQUEST_SUMMARY_HISTORY_ONGOING,
  REQUEST_SUMMARY_SUCCESS,
  REQUEST_SUMMARY_ERROR,
  REQUEST_SUMMARY_ONGOING
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import TimeScales from "../constants/TimeScales";
import MesosSummaryUtil from "../utils/MesosSummaryUtil";

var _historyServiceOnline = true;

function testHistoryServerResponse(response) {
  // If response is a range, check the last element
  let responseToTest = response;
  if (Array.isArray(response)) {
    responseToTest = response[response.length - 1];
  }
  // If the response is an empty object, that means something is whack
  // Fall back to making requests to Mesos
  // TODO (DCOS-7764): This should be improved to validate against a schema
  if (
    !Object.keys(responseToTest).length ||
    !Array.isArray(responseToTest.frameworks) ||
    !Array.isArray(responseToTest.slaves)
  ) {
    _historyServiceOnline = false;
  }
}

function testHistoryOnline() {
  RequestUtil.json({
    url: `${Config.historyServer}/dcos-history-service/history/last`,
    success(response) {
      _historyServiceOnline = true;
      testHistoryServerResponse(response);
    },
    error() {
      setTimeout(testHistoryOnline, Config.testHistoryInterval);
    }
  });
}

function requestFromHistoryServer(resolve, reject, timeScale = "last") {
  const url = `${Config.historyServer}/dcos-history-service/history/${timeScale}`;
  let successEventType = REQUEST_SUMMARY_SUCCESS;

  if (timeScale === TimeScales.MINUTE) {
    successEventType = REQUEST_SUMMARY_HISTORY_SUCCESS;
  }

  RequestUtil.json({
    url,
    success(response) {
      testHistoryServerResponse(response);
      AppDispatcher.handleServerAction({
        type: successEventType,
        data: response
      });
      resolve();
    },
    error() {
      _historyServiceOnline = false;

      setTimeout(testHistoryOnline, Config.testHistoryInterval);
      // Immediately fall back on state-summary
      requestFromMesos(resolve, reject);
    },
    hangingRequestCallback() {
      AppDispatcher.handleServerAction({
        type: REQUEST_SUMMARY_HISTORY_ONGOING
      });
    }
  });
}

function requestFromMesos(resolve, reject) {
  RequestUtil.json({
    url: `${Config.rootUrl}/mesos/master/state-summary`,
    success(response) {
      AppDispatcher.handleServerAction({
        type: REQUEST_SUMMARY_SUCCESS,
        data: response
      });
      resolve();
    },
    error(xhr) {
      AppDispatcher.handleServerAction({
        type: REQUEST_SUMMARY_ERROR,
        data: xhr.message,
        xhr
      });
      reject();
    },
    hangingRequestCallback() {
      AppDispatcher.handleServerAction({ type: REQUEST_SUMMARY_ONGOING });
    }
  });
}

var MesosSummaryActions = {
  fetchSummary: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function(resolve, reject) {
      return function(timeScale) {
        const canAccessHistoryAPI = Hooks.applyFilter(
          "hasCapability",
          false,
          "historyServiceAPI"
        );

        if (!_historyServiceOnline || !canAccessHistoryAPI) {
          const canAccessMesosAPI = Hooks.applyFilter(
            "hasCapability",
            false,
            "mesosAPI"
          );
          if (canAccessMesosAPI) {
            requestFromMesos(resolve, reject);
          } else {
            AppDispatcher.handleServerAction({
              type: REQUEST_SUMMARY_SUCCESS,
              data: MesosSummaryUtil.getEmptyState()
            });
          }
        } else {
          requestFromHistoryServer(resolve, reject, timeScale);
        }
      };
    },
    { delayAfterCount: Config.delayAfterErrorCount }
  )
};

module.exports = MesosSummaryActions;
