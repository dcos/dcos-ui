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
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
  REQUEST_MARATHON_QUEUE_SUCCESS,
  REQUEST_MARATHON_QUEUE_ERROR,
  REQUEST_MARATHON_QUEUE_ONGOING,
  REQUEST_MARATHON_INSTANCE_INFO_ERROR,
  REQUEST_MARATHON_INSTANCE_INFO_SUCCESS,
  REQUEST_MARATHON_SERVICE_CREATE_ERROR,
  REQUEST_MARATHON_SERVICE_CREATE_SUCCESS,
  REQUEST_MARATHON_SERVICE_DELETE_ERROR,
  REQUEST_MARATHON_SERVICE_DELETE_SUCCESS,
  REQUEST_MARATHON_SERVICE_EDIT_ERROR,
  REQUEST_MARATHON_SERVICE_EDIT_SUCCESS,
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
      url: `${Config.rootUrl}${Config.marathonAPIPrefix}/groups`,
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
      url: `${Config.rootUrl}${Config.marathonAPIPrefix}/apps`,
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

  deleteService: function (serviceId) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.marathonAPIPrefix}/apps/${serviceId}`,
      method: 'DELETE',
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_DELETE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  editService: function (data, force) {
    let url = `${Config.rootUrl}${Config.marathonAPIPrefix}/apps/${data.id}`;

    if (force === true) {
      url += '?force=true';
    }

    RequestUtil.json({
      url,
      method: 'PUT',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_EDIT_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_EDIT_ERROR,
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
        const url = `${Config.rootUrl}${Config.marathonAPIPrefix}/groups`;
        const embed = [
          {name: 'embed', value: 'group.groups'},
          {name: 'embed', value: 'group.apps'},
          {name: 'embed', value: 'group.apps.deployments'},
          {name: 'embed', value: 'group.apps.counts'},
          {name: 'embed', value: 'group.apps.tasks'},
          {name: 'embed', value: 'group.apps.taskStats'},
          {name: 'embed', value: 'group.apps.lastTaskFailure'}
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
          url: `${Config.rootUrl}${Config.marathonAPIPrefix}/deployments`,
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
      url: `${Config.rootUrl}${Config.marathonAPIPrefix}/apps/${serviceID}/versions/${versionID}`,
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
      url: `${Config.rootUrl}${Config.marathonAPIPrefix}/apps/${serviceID}/versions`,
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
  },

  fetchMarathonInstanceInfo: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.marathonAPIPrefix}/info`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_INSTANCE_INFO_SUCCESS,
          data: response
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_INSTANCE_INFO_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchQueue: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function (resolve, reject) {
      return function () {
        RequestUtil.json({
          url: `${Config.rootUrl}${Config.marathonAPIPrefix}/queue`,
          success: function (response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_SUCCESS,
              data: response
            });
            resolve();
          },
          error: function (e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback: function () {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_ONGOING
            });
          }
        });
      }
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  revertDeployment: function (deploymentID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.marathonAPIPrefix}/deployments/${deploymentID}`,
      method: 'DELETE',
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
          data: Object.assign({originalDeploymentID: deploymentID}, response)
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
          data: {
            originalDeploymentID: deploymentID,
            error: RequestUtil.getErrorFromXHR(xhr)
          }
        });
      }
    });
  }

};
