import { RequestUtil } from "mesosphere-shared-reactjs";
import { Hooks } from "PluginSDK";

import {
  REQUEST_SUMMARY_SUCCESS,
  REQUEST_SUMMARY_ERROR,
  REQUEST_SUMMARY_ONGOING
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import MesosSummaryUtil from "../utils/MesosSummaryUtil";

function requestFromMesos(resolve, reject) {
  // Forcing the RequestUtil to treat every new request as a unique request
  // Otherwise it would detect polling and skip some requests if one is running already
  // causing missing data
  const timestamp = Date.now();

  RequestUtil.json({
    url: `${Config.rootUrl}/mesos/master/state-summary?_ts=${timestamp}`,
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
      return function() {
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
      };
    },
    { delayAfterCount: Config.delayAfterErrorCount }
  )
};

if (Config.useFixtures) {
  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.MesosSummaryActions = {
    fetchSummary: {
      event: "success",
      success: { response: {} }
    }
  };

  Object.keys(global.actionTypes.MesosSummaryActions).forEach(function(method) {
    MesosSummaryActions[method] = RequestUtil.stubRequest(
      MesosSummaryActions,
      "MesosSummaryActions",
      method
    );
  });
}

module.exports = MesosSummaryActions;
