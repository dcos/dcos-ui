import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_MARATHON_GROUP_CREATE_ERROR,
  REQUEST_MARATHON_GROUP_CREATE_SUCCESS,
  REQUEST_MARATHON_GROUP_DELETE_ERROR,
  REQUEST_MARATHON_GROUP_DELETE_SUCCESS,
  REQUEST_MARATHON_GROUP_EDIT_ERROR,
  REQUEST_MARATHON_GROUP_EDIT_SUCCESS,
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
  REQUEST_MARATHON_SERVICE_RESTART_ERROR,
  REQUEST_MARATHON_SERVICE_RESTART_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSION_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSION_ERROR,
  REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSIONS_ERROR,
  REQUEST_MARATHON_TASK_KILL_SUCCESS,
  REQUEST_MARATHON_TASK_KILL_ERROR
} from '../constants/ActionTypes';
var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');
import MarathonUtil from '../utils/MarathonUtil';
import Util from '../utils/Util';

function buildURI(path) {
  return `${Config.rootUrl}${Config.marathonAPIPrefix}${path}`;
}

module.exports = {
  createGroup(data) {
    RequestUtil.json({
      url: buildURI('/groups'),
      method: 'POST',
      data,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_CREATE_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  deleteGroup(groupId) {
    groupId = encodeURIComponent(groupId);
    RequestUtil.json({
      url: buildURI(`/groups/${groupId}`),
      method: 'DELETE',
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_DELETE_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_DELETE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  editGroup(data, force) {
    let groupId = encodeURIComponent(data.id);
    let url = buildURI(`/groups/${groupId}`);
    data = Util.omit(data, ['id']);

    if (force === true) {
      url += '?force=true';
    }

    RequestUtil.json({
      url,
      method: 'PUT',
      data,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_EDIT_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_GROUP_EDIT_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  createService(data) {
    RequestUtil.json({
      url: buildURI('/apps'),
      method: 'POST',
      data,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_CREATE_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_CREATE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  deleteService(serviceId) {
    RequestUtil.json({
      url: buildURI(`/apps/${serviceId}`),
      method: 'DELETE',
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_DELETE_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_DELETE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  editService(data, force) {
    let url = buildURI(`/apps/${data.id}`);

    if (force === true) {
      url += '?force=true';
    }

    RequestUtil.json({
      url,
      method: 'PUT',
      data,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_EDIT_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_EDIT_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  restartService(serviceId, force = false) {
    let url = buildURI(`/apps/${serviceId}/restart`);

    if (force === true) {
      url += '?force=true';
    }

    RequestUtil.json({
      url,
      method: 'POST',
      data: force,
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_RESTART_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_RESTART_ERROR,
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
        const url = buildURI('/groups');
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
          url,
          data: embed,
          success(response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_SUCCESS,
              data: MarathonUtil.parseGroups(response)
            });
            resolve();
          },
          error(e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback() {
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
          url: buildURI('/deployments'),
          success(response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_SUCCESS,
              data: response
            });
            resolve();
          },
          error(e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback() {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  fetchServiceVersion(serviceID, versionID) {
    RequestUtil.json({
      url: buildURI(`/apps/${serviceID}/versions/${versionID}`),
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSION_SUCCESS,
          data: {serviceID, versionID, version: response}
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchServiceVersions(serviceID) {
    RequestUtil.json({
      url: buildURI(`/apps/${serviceID}/versions`),
      success(response) {
        let {versions} = response;
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS,
          data: {serviceID, versions}
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchMarathonInstanceInfo() {
    RequestUtil.json({
      url: buildURI('/info'),
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_INSTANCE_INFO_SUCCESS,
          data: response
        });
      },
      error(xhr) {
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
          url: buildURI('/queue'),
          success(response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_SUCCESS,
              data: response
            });
            resolve();
          },
          error(e) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_ERROR,
              data: e.message
            });
            reject();
          },
          hangingRequestCallback() {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_ONGOING
            });
          }
        });
      };
    },
    {delayAfterCount: Config.delayAfterErrorCount}
  ),

  revertDeployment(deploymentID) {
    RequestUtil.json({
      url: buildURI(`/deployments/${deploymentID}`),
      method: 'DELETE',
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
          data: Object.assign({originalDeploymentID: deploymentID}, response)
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
          data: {
            originalDeploymentID: deploymentID,
            error: RequestUtil.getErrorFromXHR(xhr)
          }
        });
      }
    });
  },

  killTasks(taskIDs, scaleTask) {
    let params = '';
    if (scaleTask) {
      params = '?scale=true';
    }

    RequestUtil.json({
      url: buildURI(`/tasks/delete${params}`),
      data: {ids: taskIDs},
      method: 'POST',
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_TASK_KILL_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_TASK_KILL_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  }

};
