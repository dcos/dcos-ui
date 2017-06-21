import PluginSDK from "PluginSDK";

import {
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
  REQUEST_MARATHON_DEPLOYMENTS_ERROR,
  REQUEST_MARATHON_DEPLOYMENTS_SUCCESS,
  REQUEST_MARATHON_GROUP_CREATE_ERROR,
  REQUEST_MARATHON_GROUP_CREATE_SUCCESS,
  REQUEST_MARATHON_GROUP_DELETE_ERROR,
  REQUEST_MARATHON_GROUP_DELETE_SUCCESS,
  REQUEST_MARATHON_GROUP_EDIT_ERROR,
  REQUEST_MARATHON_GROUP_EDIT_SUCCESS,
  REQUEST_MARATHON_GROUPS_ERROR,
  REQUEST_MARATHON_GROUPS_ONGOING,
  REQUEST_MARATHON_GROUPS_SUCCESS,
  REQUEST_MARATHON_INSTANCE_INFO_ERROR,
  REQUEST_MARATHON_INSTANCE_INFO_SUCCESS,
  REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR,
  REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS,
  REQUEST_MARATHON_QUEUE_ERROR,
  REQUEST_MARATHON_QUEUE_SUCCESS,
  REQUEST_MARATHON_SERVICE_CREATE_ERROR,
  REQUEST_MARATHON_SERVICE_CREATE_SUCCESS,
  REQUEST_MARATHON_SERVICE_DELETE_ERROR,
  REQUEST_MARATHON_SERVICE_DELETE_SUCCESS,
  REQUEST_MARATHON_SERVICE_EDIT_ERROR,
  REQUEST_MARATHON_SERVICE_EDIT_SUCCESS,
  REQUEST_MARATHON_SERVICE_RESTART_ERROR,
  REQUEST_MARATHON_SERVICE_RESTART_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSION_ERROR,
  REQUEST_MARATHON_SERVICE_VERSION_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSIONS_ERROR,
  REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS,
  REQUEST_MARATHON_TASK_KILL_ERROR,
  REQUEST_MARATHON_TASK_KILL_SUCCESS
} from "../constants/ActionTypes";
import { SERVER_ACTION } from "../../../../../src/js/constants/ActionTypes";
import AppDispatcher from "../../../../../src/js/events/AppDispatcher";
import CompositeState from "../../../../../src/js/structs/CompositeState";
import Config from "../../../../../src/js/config/Config";
import DeploymentsList from "../structs/DeploymentsList";
import GetSetBaseStore from "../../../../../src/js/stores/GetSetBaseStore";
import HealthStatus from "../constants/HealthStatus";
import MarathonActions from "../events/MarathonActions";
import {
  MARATHON_APPS_CHANGE,
  MARATHON_APPS_ERROR,
  MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
  MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
  MARATHON_DEPLOYMENTS_CHANGE,
  MARATHON_DEPLOYMENTS_ERROR,
  MARATHON_GROUP_CREATE_ERROR,
  MARATHON_GROUP_CREATE_SUCCESS,
  MARATHON_GROUP_DELETE_ERROR,
  MARATHON_GROUP_DELETE_SUCCESS,
  MARATHON_GROUP_EDIT_ERROR,
  MARATHON_GROUP_EDIT_SUCCESS,
  MARATHON_GROUPS_CHANGE,
  MARATHON_GROUPS_ERROR,
  MARATHON_INSTANCE_INFO_ERROR,
  MARATHON_INSTANCE_INFO_SUCCESS,
  MARATHON_POD_INSTANCE_KILL_SUCCESS,
  MARATHON_POD_INSTANCE_KILL_ERROR,
  MARATHON_QUEUE_CHANGE,
  MARATHON_QUEUE_ERROR,
  MARATHON_SERVICE_CREATE_ERROR,
  MARATHON_SERVICE_CREATE_SUCCESS,
  MARATHON_SERVICE_DELETE_ERROR,
  MARATHON_SERVICE_DELETE_SUCCESS,
  MARATHON_SERVICE_EDIT_ERROR,
  MARATHON_SERVICE_EDIT_SUCCESS,
  MARATHON_SERVICE_RESTART_ERROR,
  MARATHON_SERVICE_RESTART_SUCCESS,
  MARATHON_SERVICE_VERSION_CHANGE,
  MARATHON_SERVICE_VERSION_ERROR,
  MARATHON_SERVICE_VERSIONS_CHANGE,
  MARATHON_SERVICE_VERSIONS_ERROR,
  MARATHON_TASK_KILL_ERROR,
  MARATHON_TASK_KILL_SUCCESS,
  VISIBILITY_CHANGE
} from "../constants/EventTypes";
import Service from "../structs/Service";
import ServiceImages from "../constants/ServiceImages";
import ServiceTree from "../structs/ServiceTree";
import VisibilityStore from "../../../../../src/js/stores/VisibilityStore";

let requestInterval = null;
let shouldEmbedLastUnusedOffers = false;

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
  const options = {};

  if (shouldEmbedLastUnusedOffers) {
    options.params = "?embed=lastUnusedOffers";
  }

  MarathonActions.fetchGroups();
  MarathonActions.fetchQueue(options);
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

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        appsSuccess: MARATHON_APPS_CHANGE,
        appsError: MARATHON_APPS_ERROR,
        deploymentsSuccess: MARATHON_DEPLOYMENTS_CHANGE,
        deploymentsError: MARATHON_DEPLOYMENTS_ERROR,
        deploymentRollbackSuccess: MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
        deploymentRollbackError: MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
        instanceInfoSuccess: MARATHON_INSTANCE_INFO_SUCCESS,
        instanceInfoError: MARATHON_INSTANCE_INFO_ERROR,
        groupCreateSuccess: MARATHON_GROUP_CREATE_SUCCESS,
        groupCreateError: MARATHON_GROUP_CREATE_ERROR,
        groupDeleteSuccess: MARATHON_GROUP_DELETE_SUCCESS,
        groupDeleteError: MARATHON_GROUP_DELETE_ERROR,
        groupEditSuccess: MARATHON_GROUP_EDIT_SUCCESS,
        groupEditError: MARATHON_GROUP_EDIT_ERROR,
        groupsSuccess: MARATHON_GROUPS_CHANGE,
        groupsError: MARATHON_GROUPS_ERROR,
        podInstanceKillSuccess: MARATHON_POD_INSTANCE_KILL_SUCCESS,
        podInstanceKillError: MARATHON_POD_INSTANCE_KILL_ERROR,
        serviceCreateError: MARATHON_SERVICE_CREATE_ERROR,
        serviceCreateSuccess: MARATHON_SERVICE_CREATE_SUCCESS,
        serviceDeleteError: MARATHON_SERVICE_DELETE_ERROR,
        serviceDeleteSuccess: MARATHON_SERVICE_DELETE_SUCCESS,
        serviceEditError: MARATHON_SERVICE_EDIT_ERROR,
        serviceEditSuccess: MARATHON_SERVICE_EDIT_SUCCESS,
        serviceRestartError: MARATHON_SERVICE_RESTART_ERROR,
        serviceRestartSuccess: MARATHON_SERVICE_RESTART_SUCCESS,
        taskKillSuccess: MARATHON_TASK_KILL_SUCCESS,
        taskKillError: MARATHON_TASK_KILL_ERROR
      },
      unmountWhen(store, event) {
        if (event === "appsSuccess") {
          return store.hasProcessedApps();
        }

        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;

      switch (action.type) {
        case REQUEST_MARATHON_INSTANCE_INFO_ERROR:
          this.emit(MARATHON_INSTANCE_INFO_ERROR, action.data);
          break;
        case REQUEST_MARATHON_INSTANCE_INFO_SUCCESS:
          this.processMarathonInfoRequest(action.data);
          break;
        case REQUEST_MARATHON_GROUP_CREATE_ERROR:
          this.emit(MARATHON_GROUP_CREATE_ERROR, action.data);
          break;
        case REQUEST_MARATHON_GROUP_CREATE_SUCCESS:
          this.emit(MARATHON_GROUP_CREATE_SUCCESS);
          break;
        case REQUEST_MARATHON_GROUP_DELETE_ERROR:
          this.emit(MARATHON_GROUP_DELETE_ERROR, action.data);
          break;
        case REQUEST_MARATHON_GROUP_DELETE_SUCCESS:
          this.emit(MARATHON_GROUP_DELETE_SUCCESS);
          break;
        case REQUEST_MARATHON_GROUP_EDIT_ERROR:
          this.emit(MARATHON_GROUP_EDIT_ERROR, action.data);
          break;
        case REQUEST_MARATHON_GROUP_EDIT_SUCCESS:
          this.emit(MARATHON_GROUP_EDIT_SUCCESS);
          break;
        case REQUEST_MARATHON_SERVICE_CREATE_ERROR:
          this.emit(MARATHON_SERVICE_CREATE_ERROR, action.data);
          break;
        case REQUEST_MARATHON_SERVICE_CREATE_SUCCESS:
          this.emit(MARATHON_SERVICE_CREATE_SUCCESS);
          break;
        case REQUEST_MARATHON_SERVICE_DELETE_ERROR:
          this.emit(MARATHON_SERVICE_DELETE_ERROR, action.data);
          break;
        case REQUEST_MARATHON_SERVICE_DELETE_SUCCESS:
          this.emit(MARATHON_SERVICE_DELETE_SUCCESS);
          break;
        case REQUEST_MARATHON_SERVICE_EDIT_ERROR:
          this.emit(MARATHON_SERVICE_EDIT_ERROR, action.data);
          break;
        case REQUEST_MARATHON_SERVICE_EDIT_SUCCESS:
          this.emit(MARATHON_SERVICE_EDIT_SUCCESS);
          break;
        case REQUEST_MARATHON_SERVICE_RESTART_ERROR:
          this.emit(MARATHON_SERVICE_RESTART_ERROR, action.data);
          break;
        case REQUEST_MARATHON_SERVICE_RESTART_SUCCESS:
          this.emit(MARATHON_SERVICE_RESTART_SUCCESS);
          break;
        case REQUEST_MARATHON_GROUPS_SUCCESS:
          this.processMarathonGroups(action.data);
          break;
        case REQUEST_MARATHON_DEPLOYMENTS_SUCCESS:
          this.processMarathonDeployments(action.data);
          break;
        case REQUEST_MARATHON_GROUPS_ERROR:
          this.processMarathonGroupsError();
          break;
        case REQUEST_MARATHON_DEPLOYMENTS_ERROR:
          this.processMarathonDeploymentsError();
          break;
        case REQUEST_MARATHON_GROUPS_ONGOING:
          this.processOngoingRequest();
          break;
        case REQUEST_MARATHON_QUEUE_SUCCESS:
          this.processMarathonQueue(action.data);
          break;
        case REQUEST_MARATHON_QUEUE_ERROR:
          this.processMarathonQueueError();
          break;
        case REQUEST_MARATHON_SERVICE_VERSION_SUCCESS:
          this.processMarathonServiceVersion(action.data);
          break;
        case REQUEST_MARATHON_SERVICE_VERSION_ERROR:
          this.processMarathonServiceVersionError();
          break;
        case REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS:
          this.processMarathonServiceVersions(action.data);
          break;
        case REQUEST_MARATHON_SERVICE_VERSIONS_ERROR:
          this.processMarathonServiceVersionsError();
          break;
        case REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS:
          this.processMarathonDeploymentRollback(action.data);
          break;
        case REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR:
          this.processMarathonDeploymentRollbackError(action.data);
          break;
        case REQUEST_MARATHON_TASK_KILL_SUCCESS:
          this.emit(MARATHON_TASK_KILL_SUCCESS);
          break;
        case REQUEST_MARATHON_TASK_KILL_ERROR:
          this.emit(MARATHON_TASK_KILL_ERROR, action.data);
          break;
        case REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS:
          this.emit(MARATHON_POD_INSTANCE_KILL_SUCCESS);
          break;
        case REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR:
          this.emit(MARATHON_POD_INSTANCE_KILL_ERROR, action.data);
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
    return (
      this.listenerCount(MARATHON_GROUPS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_QUEUE_CHANGE) > 0 ||
      this.listenerCount(MARATHON_DEPLOYMENTS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_APPS_CHANGE) > 0
    );
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

  restartService() {
    return MarathonActions.restartService(...arguments);
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

  killPodInstances() {
    return MarathonActions.killPodInstances(...arguments);
  }

  killTasks() {
    return MarathonActions.killTasks(...arguments);
  }

  hasProcessedApps() {
    return Object.keys(this.get("apps")).length > 0;
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
    return this.get("info");
  }

  getServiceHealth(name) {
    const appName = name.toLowerCase();
    const marathonApps = this.get("apps");

    if (!marathonApps[appName]) {
      return HealthStatus.NA;
    }

    return marathonApps[appName].health;
  }

  getServiceImages(name) {
    const appName = name.toLowerCase();
    let appImages = null;
    const marathonApps = this.get("apps");

    if (marathonApps[appName]) {
      appImages = marathonApps[appName].images;
    }

    return appImages;
  }

  getServiceInstalledTime(name) {
    const appName = name.toLowerCase();
    let appInstalledTime = null;
    const marathonApps = this.get("apps");

    if (marathonApps[appName]) {
      appInstalledTime = marathonApps[appName].snapshot.version;
    }

    return appInstalledTime;
  }

  getServiceVersion(name) {
    const appName = name.toLowerCase();
    const marathonApps = this.get("apps");

    if (marathonApps[appName]) {
      return this.getVersion(marathonApps[appName].snapshot);
    }

    return null;
  }

  getVersion(app) {
    if (
      app == null ||
      app.labels == null ||
      app.labels.DCOS_PACKAGE_VERSION == null
    ) {
      return null;
    }

    return app.labels.DCOS_PACKAGE_VERSION;
  }

  getServiceFromName(name) {
    return this.get("apps")[name];
  }

  processMarathonInfoRequest(info) {
    this.set({ info });
    this.emit(MARATHON_INSTANCE_INFO_SUCCESS);
  }

  processMarathonGroups(data) {
    const groups = new ServiceTree(data);

    const apps = groups.reduceItems(function(map, item) {
      if (item instanceof Service) {
        map[item.getName().toLowerCase()] = {
          health: item.getHealth(),
          images: item.getImages(),
          snapshot: item.get()
        };
      }

      return map;
    }, {});

    const numberOfApps = Object.keys(apps).length;
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

    this.set({ apps });
    this.set({ groups });

    CompositeState.addMarathonApps(apps);

    this.emit(MARATHON_APPS_CHANGE, apps);
    this.emit(MARATHON_GROUPS_CHANGE, groups);
  }

  processMarathonGroupsError() {
    this.emit(MARATHON_APPS_ERROR);
    this.emit(MARATHON_GROUPS_ERROR);
  }

  processMarathonDeployments(data) {
    const deployments = new DeploymentsList({ items: data });
    this.set({ deployments });
    this.emit(MARATHON_DEPLOYMENTS_CHANGE, deployments);
  }

  processMarathonDeploymentsError() {
    this.emit(MARATHON_DEPLOYMENTS_ERROR);
  }

  processMarathonDeploymentRollback(data) {
    const id = data.originalDeploymentID;
    if (id != null) {
      const deployments = this.get("deployments").filterItems(function(
        deployment
      ) {
        return deployment.getId() !== id;
      });
      this.set({ deployments });
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

  processMarathonServiceVersions(service) {
    let { serviceID, versions } = service;
    versions = versions.reduce(function(map, version) {
      return map.set(version);
    }, new Map());

    this.emit(MARATHON_SERVICE_VERSIONS_CHANGE, { serviceID, versions });
  }

  processMarathonServiceVersionsError() {
    this.emit(MARATHON_SERVICE_VERSIONS_ERROR);
  }

  processMarathonServiceVersion(service) {
    const { serviceID, version, versionID } = service;
    // TODO (orlandohohmeier): Convert version into typed version struct
    this.emit(MARATHON_SERVICE_VERSION_CHANGE, {
      serviceID,
      versionID,
      version
    });
  }

  processMarathonServiceVersionError() {
    this.emit(MARATHON_SERVICE_VERSION_ERROR);
  }

  get storeID() {
    return "marathon";
  }

  setShouldEmbedLastUnusedOffers(value) {
    shouldEmbedLastUnusedOffers = value;

    // Restart polling to immediately use the updated embed params.
    stopPolling();
    startPolling();
  }
}

module.exports = new MarathonStore();
