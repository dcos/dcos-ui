import {RequestUtil} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';

const ConfigActions = {
  fetchConfig: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}/dcos-metadata/ui-config.json`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CONFIG_SUCCESS,
          data: response
        });
      },
      error: function (e) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CONFIG_ERROR,
          data: e.message
        });
      }
    });
  },

  fetchCCID: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}/navstar/lashup/key`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CLUSTER_CCID_SUCCESS,
          data: response
        });
      },
      error: function () {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_CLUSTER_CCID_ERROR
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
    fetchConfig: {event: 'success', success: {
      response: Config.uiConfigurationFixture
    }}
  };

  Object.keys(global.actionTypes.ConfigActions).forEach(function (method) {
    ConfigActions[method] = RequestUtil.stubRequest(
      ConfigActions, 'ConfigActions', method
    );
  });
}

module.exports = ConfigActions;
