import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_MARATHON_GROUP_CREATE_ERROR,
  REQUEST_MARATHON_GROUP_CREATE_SUCCESS,
  REQUEST_MARATHON_GROUPS_SUCCESS,
  REQUEST_MARATHON_GROUPS_ERROR,
  REQUEST_MARATHON_GROUPS_ONGOING,
  REQUEST_MARATHON_DEPLOYMENTS_SUCCESS,
  REQUEST_MARATHON_DEPLOYMENTS_ERROR,
  REQUEST_MARATHON_DEPLOYMENTS_ONGOING,
  REQUEST_MARATHON_SERVICE_CREATE_ERROR,
  REQUEST_MARATHON_SERVICE_CREATE_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSION_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSION_ERROR,
  REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSIONS_ERROR
} from '../constants/ActionTypes';
var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');
import MarathonUtil from '../utils/MarathonUtil';

module.exports = {

  createGroup: function (data) {
    RequestUtil.json({
      url: `${Config.rootUrl}/marathon/v2/groups`,
      method: 'POST',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_CREATE_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  createService: function (data) {
    RequestUtil.json({
      url: `${Config.rootUrl}/marathon/v2/apps`,
      method: 'POST',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_CREATE_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_CREATE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  fetchGroups: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        const url = `${Config.rootUrl}/marathon/v2/groups`;
        const embed = [
          {name: 'embed', value: 'group.groups'},
          {name: 'embed', value: 'group.apps'},
          {name: 'embed', value: 'group.apps.deployments'},
          {name: 'embed', value: 'group.apps.counts'},
          {name: 'embed', value: 'group.apps.tasks'}
        ];

        RequestUtil.json({
          url: url,
          data: embed,
          success: function (response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_SUCCESS,
              data: MarathonUtil.parseGroups(response)
            });
            resolve();
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  fetchDeployments: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        RequestUtil.json({
          url: `${Config.rootUrl}/marathon/v2/deployments`,
          success: function (response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_SUCCESS,
              data: response
            });
            resolve();
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_ONGOING
            });
          }
        });
      }
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  fetchServiceVersion: function (serviceID, versionID) {
    RequestUtil.json({
      url: `${Config.rootUrl}/marathon/v2/apps/${serviceID}/versions/${versionID}`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSION_SUCCESS,
          data: {serviceID, versionID, version: response}
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchServiceVersions: function (serviceID) {
    RequestUtil.json({
      url: `${Config.rootUrl}/marathon/v2/apps/${serviceID}/versions`,
      success: function (response) {
        let {versions} = response;
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS,
          data: {serviceID, versions}
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  }

};
