import { RequestUtil } from "mesosphere-shared-reactjs";

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
  REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR,
  REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS,
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
} from "../constants/ActionTypes";
import AppDispatcher from "../../../../../src/js/events/AppDispatcher";
import Config from "../../../../../src/js/config/Config";
import MarathonUtil from "../utils/MarathonUtil";
import Pod from "../structs/Pod";
import PodSpec from "../structs/PodSpec";
import Service from "../structs/Service";
import Util from "../../../../../src/js/utils/Util";

function buildURI(path) {
  return `${Config.rootUrl}${Config.marathonAPIPrefix}${path}`;
}

var MarathonActions = {
  createGroup(data) {
    RequestUtil.json({
      url: buildURI("/groups"),
      method: "POST",
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

  deleteGroup(groupId, force) {
    groupId = encodeURIComponent(groupId);
    let url = buildURI(`/groups/${groupId}`);

    if (force === true) {
      url += "?force=true";
    }

    RequestUtil.json({
      url,
      method: "DELETE",
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
    const groupId = encodeURIComponent(data.id);
    let url = buildURI(`/groups/${groupId}`);
    data = Util.omit(data, ["id"]);

    if (force === true) {
      url += "?force=true";
    }

    RequestUtil.json({
      url,
      method: "PUT",
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

  /**
   * Create a service (app, framework, or pod)
   *
   * @param {ServiceSpec} spec
   */
  createService(spec) {
    // TODO (DCOS-9621): Validate input and only accept instances of ServiceSpec

    // Always default to the `/apps` endpoint to create services
    let url = buildURI("/apps");

    if (spec instanceof PodSpec) {
      url = buildURI("/pods");
    }

    RequestUtil.json({
      url,
      method: "POST",
      data: spec,
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

  /**
   * Delete a service (app, framework, or pod)
   *
   * @param {Service} service - the service you want to delete
   * @param {Boolean} force - force delete even if deploying
   */
  deleteService(service, force) {
    let url = buildURI(`/apps/${service.getId()}`);

    if (service instanceof Pod) {
      url = buildURI(`/pods/${service.getId()}`);
    }

    if (force === true) {
      url += "?force=true";
    }

    RequestUtil.json({
      url,
      method: "DELETE",
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

  /**
   * Edit service (app, framework, or pod)
   *
   * @param {Service} service - the service you wish to edit
   * @param {ServiceSpec} spec - the new service spec
   * @param {Boolean} force - force deploy change
   */
  editService(service, spec, force) {
    // TODO (DCOS-9621): Only accept instances of ServiceSpec for spec
    if (!(service instanceof Service)) {
      if (process.env.NODE_ENV !== "production") {
        throw new TypeError("service is not an instance of Service");
      }

      return;
    }

    let url = buildURI(`/apps/${service.getId()}`);
    const params = {
      force,
      partialUpdate: false // Switching Marathon edit endpoint into proper PUT
    };

    if (service instanceof Pod) {
      url = buildURI(`/pods/${service.getId()}`);
    }

    url = url + Util.objectToGetParams(params);

    RequestUtil.json({
      url,
      method: "PUT",
      data: spec,
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

  restartService(service, force = false) {
    if (!(service instanceof Service)) {
      if (process.env.NODE_ENV !== "production") {
        throw new TypeError("service is not an instance of Service");
      }

      return;
    }

    let url = buildURI(`/apps/${service.getId()}/restart`);

    if (service instanceof Pod) {
      url = buildURI(`/pods/${service.getId()}/restart`);
    }

    if (force === true) {
      url += "?force=true";
    }

    RequestUtil.json({
      url,
      method: "POST",
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
    function(resolve, reject) {
      return function() {
        const url = buildURI("/groups");
        const embed = [
          { name: "embed", value: "group.groups" },
          { name: "embed", value: "group.apps" },
          { name: "embed", value: "group.pods" },
          { name: "embed", value: "group.apps.deployments" },
          { name: "embed", value: "group.apps.counts" },
          { name: "embed", value: "group.apps.tasks" },
          { name: "embed", value: "group.apps.taskStats" },
          { name: "embed", value: "group.apps.lastTaskFailure" }
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
          error(xhr) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_GROUPS_ERROR,
              data: xhr.message,
              xhr
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
    { delayAfterCount: Config.delayAfterErrorCount }
  ),

  fetchDeployments: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function(resolve, reject) {
      return function() {
        RequestUtil.json({
          url: buildURI("/deployments"),
          success(response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_SUCCESS,
              data: response
            });
            resolve();
          },
          error(xhr) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_DEPLOYMENTS_ERROR,
              data: xhr.message,
              xhr
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
    { delayAfterCount: Config.delayAfterErrorCount }
  ),

  fetchServiceVersion(serviceID, versionID) {
    RequestUtil.json({
      url: buildURI(`/apps/${serviceID}/versions/${versionID}`),
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSION_SUCCESS,
          data: { serviceID, versionID, version: response }
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  fetchServiceVersions(serviceID) {
    RequestUtil.json({
      url: buildURI(`/apps/${serviceID}/versions`),
      success(response) {
        const { versions } = response;
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS,
          data: { serviceID, versions }
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_SERVICE_VERSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  fetchMarathonInstanceInfo() {
    RequestUtil.json({
      url: buildURI("/info"),
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_INSTANCE_INFO_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_INSTANCE_INFO_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  fetchQueue: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    function(resolve, reject) {
      return function(options = {}) {
        const queryParams = options.params || "";

        RequestUtil.json({
          url: buildURI(`/queue${queryParams}`),
          success(response) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_SUCCESS,
              data: response
            });
            resolve();
          },
          error(xhr) {
            AppDispatcher.handleServerAction({
              type: REQUEST_MARATHON_QUEUE_ERROR,
              data: xhr.message,
              xhr
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
    { delayAfterCount: Config.delayAfterErrorCount }
  ),

  revertDeployment(deploymentID) {
    RequestUtil.json({
      url: buildURI(`/deployments/${deploymentID}`),
      method: "DELETE",
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
          data: Object.assign({ originalDeploymentID: deploymentID }, response)
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
          data: {
            originalDeploymentID: deploymentID,
            error: RequestUtil.parseResponseBody(xhr)
          },
          xhr
        });
      }
    });
  },

  killTasks(taskIDs, scaleTask, force) {
    let params = [];
    if (scaleTask) {
      params.push("scale=true");
    }
    if (force) {
      params.push("force=true");
    }

    if (params.length > 0) {
      params = `?${params.join("&")}`;
    }

    RequestUtil.json({
      url: buildURI(`/tasks/delete${params}`),
      data: { ids: taskIDs },
      method: "POST",
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_TASK_KILL_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_TASK_KILL_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  killPodInstances(pod, instanceIDs, force) {
    const podID = pod.getId().replace(/^\//, "");
    let params = "";

    if (force) {
      params = "?force=true";
    }

    RequestUtil.json({
      url: buildURI(`/pods/${podID}::instances${params}`),
      data: instanceIDs,
      method: "DELETE",
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const groupsFixture = require("../../../../../tests/_fixtures/marathon-pods/groups.json");

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.MarathonActions = {
    createService: {
      event: "success",
      success: { response: {} }
    },
    deleteService: {
      event: "success",
      success: { response: {} }
    },
    editService: {
      event: "success",
      success: { response: {} }
    },
    restartService: {
      event: "success",
      success: { response: {} }
    },
    fetchGroups: {
      event: "success",
      success: { response: groupsFixture }
    }
  };

  Object.keys(global.actionTypes.MarathonActions).forEach(function(method) {
    MarathonActions[method] = RequestUtil.stubRequest(
      MarathonActions,
      "MarathonActions",
      method
    );
  });
}

module.exports = MarathonActions;
