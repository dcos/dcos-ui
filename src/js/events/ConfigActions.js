import { RequestUtil } from "mesosphere-shared-reactjs";

import ActionTypes from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";

const ConfigActions = {
  fetchConfig() {
    if (global.APPLICATION_CONFIGURATION) {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CONFIG_SUCCESS,
        data: JSON.parse(global.APPLICATION_CONFIGURATION)
      });
    }

    RequestUtil.json({
      url: `${Config.rootUrl}/dcos-metadata/ui-config.json`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CONFIG_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CONFIG_ERROR,
          data: xhr.message,
          xhr
        });
      }
    });
  },

  fetchCCID() {
    RequestUtil.json({
      url: `${Config.rootUrl}/navstar/lashup/key`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CLUSTER_CCID_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CLUSTER_CCID_ERROR,
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures || Config.useUIConfigFixtures) {
  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.ConfigActions = {
    fetchConfig: {
      event: "success",
      success: {
        response: Config.uiConfigurationFixture
      }
    }
  };

  Object.keys(global.actionTypes.ConfigActions).forEach(function(method) {
    ConfigActions[method] = RequestUtil.stubRequest(
      ConfigActions,
      "ConfigActions",
      method
    );
  });
}

module.exports = ConfigActions;
