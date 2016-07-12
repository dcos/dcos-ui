import AppDispatcher from '../events/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import GetSetBaseStore from './GetSetBaseStore';
import DeploymentsList from '../structs/DeploymentsList';
import CompositeState from '../structs/CompositeState';
import Service from '../structs/Service';
import ServiceTree from '../structs/ServiceTree';
import Config from '../config/Config';
import {
  MARATHON_APPS_CHANGE,
  MARATHON_APPS_ERROR,
  MARATHON_GROUP_CREATE_SUCCESS,
  MARATHON_GROUP_CREATE_ERROR,
  MARATHON_GROUP_DELETE_ERROR,
  MARATHON_GROUP_DELETE_SUCCESS,
  MARATHON_GROUP_EDIT_ERROR,
  MARATHON_GROUP_EDIT_SUCCESS,
  MARATHON_GROUPS_CHANGE,
  MARATHON_GROUPS_ERROR,
  MARATHON_DEPLOYMENTS_CHANGE,
  MARATHON_DEPLOYMENTS_ERROR,
  MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
  MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
  MARATHON_INSTANCE_INFO_SUCCESS,
  MARATHON_INSTANCE_INFO_ERROR,
  MARATHON_QUEUE_CHANGE,
  MARATHON_QUEUE_ERROR,
  MARATHON_SERVICE_CREATE_ERROR,
  MARATHON_SERVICE_CREATE_SUCCESS,
  MARATHON_SERVICE_DELETE_ERROR,
  MARATHON_SERVICE_DELETE_SUCCESS,
  MARATHON_SERVICE_EDIT_ERROR,
  MARATHON_SERVICE_EDIT_SUCCESS,
  MARATHON_SERVICE_VERSION_CHANGE,
  MARATHON_SERVICE_VERSION_ERROR,
  MARATHON_SERVICE_VERSIONS_CHANGE,
  MARATHON_SERVICE_VERSIONS_ERROR,
  MARATHON_TASK_KILL_SUCCESS,
  MARATHON_TASK_KILL_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
var HealthStatus = require('../constants/HealthStatus');
var MarathonActions = require('../events/MarathonActions');
var ServiceImages = require('../constants/ServiceImages');
import VisibilityStore from './VisibilityStore';

var requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    poll();
    requestInterval = global.setInterval(poll, Config.getRefreshRate());
  }
}

function stopPolling() {
  if (requestInterval != null) {
    global.clearInterval(requestInterval);
    requestInterval = null;
  }
}

function poll() {
  MarathonActions.fetchGroups();
  MarathonActions.fetchQueue();
  MarathonActions.fetchDeployments();
}

class MarathonStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      apps: {},
      deployments: new DeploymentsList(),
      groups: new ServiceTree(),
      info: {}
    };

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== ActionTypes.SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case ActionTypes.REQUEST_MARATHON_INSTANCE_INFO_ERROR:
          this.emit(MARATHON_INSTANCE_INFO_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_INSTANCE_INFO_SUCCESS:
          this.processMarathonInfoRequest(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUP_CREATE_ERROR:
          this.emit(MARATHON_GROUP_CREATE_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUP_CREATE_SUCCESS:
          this.emit(MARATHON_GROUP_CREATE_SUCCESS);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUP_DELETE_ERROR:
          let message = action.data;
          if (!Object.keys(message).length) {
            message = 'Error destroying group';
          }
          this.emit(MARATHON_GROUP_DELETE_ERROR, message);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUP_DELETE_SUCCESS:
          this.emit(MARATHON_GROUP_DELETE_SUCCESS);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUP_EDIT_ERROR:
          this.emit(MARATHON_GROUP_EDIT_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUP_EDIT_SUCCESS:
          this.emit(MARATHON_GROUP_EDIT_SUCCESS);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_ERROR:
          this.emit(MARATHON_SERVICE_CREATE_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_SUCCESS:
          this.emit(MARATHON_SERVICE_CREATE_SUCCESS);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_ERROR:
          let message = action.data;
          if (!Object.keys(message).length) {
            message = 'Error destroying service';
          }
          this.emit(MARATHON_SERVICE_DELETE_ERROR, message);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_DELETE_SUCCESS:
          this.emit(MARATHON_SERVICE_DELETE_SUCCESS);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_ERROR:
          this.emit(MARATHON_SERVICE_EDIT_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_EDIT_SUCCESS:
          this.emit(MARATHON_SERVICE_EDIT_SUCCESS);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUPS_SUCCESS:
          this.processMarathonGroups(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_SUCCESS:
          this.processMarathonDeployments(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_GROUPS_ERROR:
          this.processMarathonGroupsError();
          break;
        case ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_ERROR:
          this.processMarathonDeploymentsError();
          break;
        case ActionTypes.REQUEST_MARATHON_GROUPS_ONGOING:
          this.processOngoingRequest();
          break;
        case ActionTypes.REQUEST_MARATHON_QUEUE_SUCCESS:
          this.processMarathonQueue(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_QUEUE_ERROR:
          this.processMarathonQueueError();
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_SUCCESS:
          this.processMarathonServiceVersion(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_ERROR:
          this.processMarathonServiceVersionError();
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS:
          this.processMarathonServiceVersions(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_ERROR:
          this.processMarathonServiceVersionsError();
          break;
        case ActionTypes.REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS:
          this.processMarathonDeploymentRollback(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR:
          this.processMarathonDeploymentRollbackError(action.data);
          break;
        case ActionTypes.REQUEST_MARATHON_TASK_KILL_SUCCESS:
          this.emit(MARATHON_TASK_KILL_SUCCESS);
          break;
        case ActionTypes.REQUEST_MARATHON_TASK_KILL_ERROR:
          this.emit(MARATHON_TASK_KILL_ERROR);
          break;
      }

      return true;
    });

    VisibilityStore.addChangeListener(
      VISIBILITY_CHANGE,
      this.onVisibilityStoreChange.bind(this)
    );
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);

    if (this.shouldPoll()) {
      startPolling();
    }
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  }

  onVisibilityStoreChange() {
    if (!VisibilityStore.isInactive() && this.shouldPoll()) {
      startPolling();
      return;
    }

    stopPolling();
  }

  shouldPoll() {
    return this.listenerCount(MARATHON_GROUPS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_QUEUE_CHANGE) > 0 ||
      this.listenerCount(MARATHON_DEPLOYMENTS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_APPS_CHANGE) > 0;
  }

  changeService() {
    return MarathonActions.changeService(...arguments);
  }

  createGroup() {
    return MarathonActions.createGroup(...arguments);
  }

  deleteGroup() {
    return MarathonActions.deleteGroup(...arguments);
  }

  editGroup() {
    return MarathonActions.editGroup(...arguments);
  }

  createService() {
    return MarathonActions.createService(...arguments);
  }

  deleteService() {
    return MarathonActions.deleteService(...arguments);
  }

  editService() {
    return MarathonActions.editService(...arguments);
  }

  fetchQueue() {
    return MarathonActions.fetchQueue(...arguments);
  }

  fetchServiceVersion() {
    return MarathonActions.fetchServiceVersion(...arguments);
  }

  fetchServiceVersions() {
    return MarathonActions.fetchServiceVersions(...arguments);
  }

  fetchMarathonInstanceInfo() {
    return MarathonActions.fetchMarathonInstanceInfo(...arguments);
  }

  killTasks() {
    return MarathonActions.killTasks(...arguments);
  }

  hasProcessedApps() {
    return !!Object.keys(this.get('apps')).length;
  }

  getFrameworkHealth(app) {
    if (app.healthChecks == null || app.healthChecks.length === 0) {
      return HealthStatus.NA;
    }

    var health = HealthStatus.IDLE;
    if (app.tasksUnhealthy > 0) {
      health = HealthStatus.UNHEALTHY;
    } else if (app.tasksRunning > 0 && app.tasksHealthy === app.tasksRunning) {
      health = HealthStatus.HEALTHY;
    }

    return health;
  }

  getInstanceInfo() {
    return this.get('info');
  }

  getServiceHealth(name) {
    let appName = name.toLowerCase();
    let marathonApps = this.get('apps');

    if (!marathonApps[appName]) {
      return HealthStatus.NA;
    }

    return marathonApps[appName].health;
  }

  getServiceImages(name) {
    let appName = name.toLowerCase();
    let appImages = null;
    let marathonApps = this.get('apps');

    if (marathonApps[appName]) {
      appImages = marathonApps[appName].images;
    }

    return appImages;
  }

  getServiceInstalledTime(name) {
    let appName = name.toLowerCase();
    let appInstalledTime = null;
    let marathonApps = this.get('apps');

    if (marathonApps[appName]) {
      appInstalledTime = marathonApps[appName].snapshot.version;
    }

    return appInstalledTime;
  }

  getServiceVersion(name) {
    let appName = name.toLowerCase();
    let marathonApps = this.get('apps');

    if (marathonApps[appName]) {
      return this.getVersion(marathonApps[appName].snapshot);
    }

    return null;
  }

  getVersion(app) {
    if (app == null ||
      app.labels == null ||
      app.labels.DCOS_PACKAGE_VERSION == null) {
      return null;
    }

    return app.labels.DCOS_PACKAGE_VERSION;
  }

  getServiceFromName(name) {
    return this.get('apps')[name];
  }

  getServiceNameFromTaskID(taskID) {
    let serviceName = taskID.split('.')[0].split('_');
    return serviceName[serviceName.length - 1];
  }

  getServiceFromTaskID(taskID) {
    let service = this.get('apps')[this.getServiceNameFromTaskID(taskID)];

    if (service == null) {
      return null;
    }

    return new Service(service.snapshot);
  }

  getTaskFromTaskID(taskID) {
    let service = this.getServiceFromTaskID(taskID);
    if (service == null || service.tasks == null || !service.tasks.length) {
      return null;
    }

    return service.tasks.find(function (task) {
      return task.id === taskID;
    });
  }

  processMarathonInfoRequest(info) {
    this.set({info});
    this.emit(MARATHON_INSTANCE_INFO_SUCCESS);
  }

  processMarathonGroups(data) {
    let groups = new ServiceTree(data);

    let apps = groups.reduceItems(function (map, item) {
      if (item instanceof Service) {
        map[item.getName().toLowerCase()] = {
          health: item.getHealth(),
          images: item.getImages(),
          snapshot: item.get()
        };
      }

      return map;
    }, {});

    let numberOfApps = Object.keys(apps).length;
    // Specific health check for Marathon
    // We are setting the 'marathon' key here, since we can safely assume,
    // it to be 'marathon' (we control it).
    // This means that no other framework should be named 'marathon'.
    apps.marathon = {
      health: this.getFrameworkHealth({
        // Make sure health check has a result
        healthChecks: [{}],
        // Marathon is healthy if this request returned apps
        tasksHealthy: numberOfApps,
        tasksRunning: numberOfApps
      }),
      images: ServiceImages.MARATHON_IMAGES
    };

    this.set({apps});
    this.set({groups});

    CompositeState.addMarathonApps(apps);

    this.emit(MARATHON_APPS_CHANGE, apps);
    this.emit(MARATHON_GROUPS_CHANGE, groups);
  }

  processMarathonGroupsError() {
    this.emit(MARATHON_APPS_ERROR);
    this.emit(MARATHON_GROUPS_ERROR);
  }

  processMarathonDeployments(data) {
    let deployments = new DeploymentsList({items: data});
    this.set({deployments});
    this.emit(MARATHON_DEPLOYMENTS_CHANGE, deployments);
  }

  processMarathonDeploymentsError() {
    this.emit(MARATHON_DEPLOYMENTS_ERROR);
  }

  processMarathonDeploymentRollback(data) {
    let id = data.originalDeploymentID;
    if (id != null) {
      let deployments = this.get('deployments')
        .filterItems(function (deployment) {
          return deployment.getId() !== id;
        });
      this.set({deployments});
      this.emit(MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS, data);
      this.emit(MARATHON_DEPLOYMENTS_CHANGE);
    }
  }

  processMarathonDeploymentRollbackError(data) {
    this.emit(MARATHON_DEPLOYMENT_ROLLBACK_ERROR, data);
  }

  processMarathonQueue(data) {
    if (data.queue != null) {
      this.emit(MARATHON_QUEUE_CHANGE, data.queue);
    }
  }

  processMarathonQueueError() {
    this.emit(MARATHON_QUEUE_ERROR);
  }

  processOngoingRequest() {
    // Handle ongoing request here.
  }

  processMarathonServiceVersions({serviceID, versions}) {
    versions = versions.reduce(function (map, version) {
      return map.set(version);
    }, new Map());

    this.emit(MARATHON_SERVICE_VERSIONS_CHANGE, {serviceID, versions});
  }

  processMarathonServiceVersionsError() {
    this.emit(MARATHON_SERVICE_VERSIONS_ERROR);
  }

  processMarathonServiceVersion({serviceID, version, versionID}) {
    // TODO (orlandohohmeier): Convert version into typed version struct
    this.emit(MARATHON_SERVICE_VERSION_CHANGE, {serviceID, versionID, version});
  }

  processMarathonServiceVersionError() {
    this.emit(MARATHON_SERVICE_VERSION_ERROR);
  }

  get storeID() {
    return 'marathon';
  }
}

module.exports = new MarathonStore();
