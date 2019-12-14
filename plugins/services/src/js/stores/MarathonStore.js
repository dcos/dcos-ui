import PluginSDK from "PluginSDK";

import { SERVER_ACTION } from "#SRC/js/constants/ActionTypes";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import Config from "#SRC/js/config/Config";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import GetSetBaseStore from "#SRC/js/stores/GetSetBaseStore";

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
  REQUEST_MARATHON_SERVICE_RESET_DELAY_ERROR,
  REQUEST_MARATHON_SERVICE_RESET_DELAY_SUCCESS,
  REQUEST_MARATHON_SERVICE_RESTART_ERROR,
  REQUEST_MARATHON_SERVICE_RESTART_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSION_ERROR,
  REQUEST_MARATHON_SERVICE_VERSION_SUCCESS,
  REQUEST_MARATHON_SERVICE_VERSIONS_ERROR,
  REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS,
  REQUEST_MARATHON_TASK_KILL_ERROR,
  REQUEST_MARATHON_TASK_KILL_SUCCESS
} from "../constants/ActionTypes";
import DeploymentsList from "../structs/DeploymentsList";
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
  MARATHON_SERVICE_RESET_DELAY_ERROR,
  MARATHON_SERVICE_RESET_DELAY_SUCCESS,
  MARATHON_SERVICE_RESTART_ERROR,
  MARATHON_SERVICE_RESTART_SUCCESS,
  MARATHON_SERVICE_VERSION_CHANGE,
  MARATHON_SERVICE_VERSION_ERROR,
  MARATHON_SERVICE_VERSIONS_CHANGE,
  MARATHON_SERVICE_VERSIONS_ERROR,
  MARATHON_TASK_KILL_ERROR,
  MARATHON_TASK_KILL_SUCCESS
} from "../constants/EventTypes";
import Framework from "../structs/Framework";
import Application from "../structs/Application";
import ServiceImages from "../constants/ServiceImages";
import ServiceTree from "../structs/ServiceTree";

import ServiceValidatorUtil from "../utils/ServiceValidatorUtil";

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
  constructor(...args) {
    super(...args);

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
        serviceResetDelayError: MARATHON_SERVICE_RESET_DELAY_ERROR,
        serviceResetDelaySuccess: MARATHON_SERVICE_RESET_DELAY_SUCCESS,
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

    AppDispatcher.register(payload => {
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
        case REQUEST_MARATHON_SERVICE_RESET_DELAY_ERROR:
          this.emit(MARATHON_SERVICE_RESET_DELAY_ERROR, action.data);
          break;
        case REQUEST_MARATHON_SERVICE_RESET_DELAY_SUCCESS:
          this.emit(MARATHON_SERVICE_RESET_DELAY_SUCCESS);
          break;
        case REQUEST_MARATHON_GROUPS_SUCCESS:
          this.injectGroupsWithPackageImages(action.data);
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

  shouldPoll() {
    return (
      this.listenerCount(MARATHON_GROUPS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_QUEUE_CHANGE) > 0 ||
      this.listenerCount(MARATHON_DEPLOYMENTS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_APPS_CHANGE) > 0
    );
  }

  changeService(...args) {
    return MarathonActions.changeService(...args);
  }

  createGroup(...args) {
    return MarathonActions.createGroup(...args);
  }

  deleteGroup(...args) {
    return MarathonActions.deleteGroup(...args);
  }

  editGroup(...args) {
    return MarathonActions.editGroup(...args);
  }

  createService(...args) {
    return MarathonActions.createService(...args);
  }

  deleteService(...args) {
    return MarathonActions.deleteService(...args);
  }

  editService(...args) {
    return MarathonActions.editService(...args);
  }

  resetDelayedService(...args) {
    return MarathonActions.resetDelayedService(...args);
  }

  restartService(...args) {
    return MarathonActions.restartService(...args);
  }

  fetchQueue(...args) {
    return MarathonActions.fetchQueue(...args);
  }

  fetchServiceVersion(...args) {
    return MarathonActions.fetchServiceVersion(...args);
  }

  fetchServiceVersions(...args) {
    return MarathonActions.fetchServiceVersions(...args);
  }

  fetchMarathonInstanceInfo(...args) {
    return MarathonActions.fetchMarathonInstanceInfo(...args);
  }

  killPodInstances(...args) {
    return MarathonActions.killPodInstances(...args);
  }

  killTasks(...args) {
    return MarathonActions.killTasks(...args);
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

  injectGroupsWithPackageImages(data) {
    data.items.forEach(item => {
      if (item.items && Array.isArray(item.items)) {
        this.injectGroupsWithPackageImages(item);
      } else if (
        (ServiceValidatorUtil.isFrameworkResponse(item) ||
          ServiceValidatorUtil.isApplicationResponse(item)) &&
        item.labels &&
        item.labels.DCOS_PACKAGE_NAME
      ) {
        item["images"] = CosmosPackagesStore.getPackageImages()[
          item.labels.DCOS_PACKAGE_NAME
        ];
      }
    });
  }

  processMarathonInfoRequest(info) {
    this.set({ info });
    this.emit(MARATHON_INSTANCE_INFO_SUCCESS);
  }

  processMarathonGroups(data) {
    const groups = new ServiceTree(data);

    const apps = groups.reduceItems((map, item) => {
      if (item instanceof Framework) {
        map[item.getFrameworkName().toLowerCase()] = {
          health: item.getHealth(),
          images: item.getImages(),
          snapshot: item.get()
        };
      }

      if (item instanceof Application) {
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

    this.emit(MARATHON_APPS_CHANGE, apps);
    this.emit(MARATHON_GROUPS_CHANGE, groups);
  }

  processMarathonGroupsError() {
    this.emit(MARATHON_APPS_ERROR);
    this.emit(MARATHON_GROUPS_ERROR);
  }

  processMarathonDeployments(data) {
    if (Array.isArray(data)) {
      const deployments = new DeploymentsList({ items: data });
      this.set({ deployments });
      this.emit(MARATHON_DEPLOYMENTS_CHANGE, deployments);
    } else {
      this.processMarathonDeploymentsError();
    }
  }

  processMarathonDeploymentsError() {
    this.emit(MARATHON_DEPLOYMENTS_ERROR);
  }

  processMarathonDeploymentRollback(data) {
    const id = data.originalDeploymentID;
    if (id != null) {
      const deployments = this.get("deployments").filterItems(
        deployment => deployment.getId() !== id
      );
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
    versions = versions.reduce((map, version) => map.set(version), new Map());

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

export default new MarathonStore();
