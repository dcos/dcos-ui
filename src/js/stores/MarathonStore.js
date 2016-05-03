import {Store} from 'mesosphere-shared-reactjs';

var AppDispatcher = require('../events/AppDispatcher');
import ActionTypes from '../constants/ActionTypes';
import DeploymentsList from '../structs/DeploymentsList';
import CompositeState from '../structs/CompositeState';
import Service from '../structs/Service';
import ServiceTree from '../structs/ServiceTree';
var Config = require('../config/Config');
import {
  MARATHON_APPS_CHANGE,
  MARATHON_APPS_ERROR,
  MARATHON_GROUPS_CHANGE,
  MARATHON_GROUPS_ERROR,
  MARATHON_DEPLOYMENTS_CHANGE,
  MARATHON_DEPLOYMENTS_ERROR,
  MARATHON_SERVICE_VERSION_CHANGE,
  MARATHON_SERVICE_VERSION_ERROR,
  MARATHON_SERVICE_VERSIONS_CHANGE,
  MARATHON_SERVICE_VERSIONS_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
var GetSetMixin = require('../mixins/GetSetMixin');
var HealthStatus = require('../constants/HealthStatus');
var MarathonActions = require('../events/MarathonActions');
var ServiceImages = require('../constants/ServiceImages');
import VisibilityStore from './VisibilityStore';

var requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    MarathonActions.fetchGroups();
    MarathonActions.fetchDeployments();
    requestInterval = global.setInterval(
      function () {
        MarathonActions.fetchGroups();
        MarathonActions.fetchDeployments();
      }, Config.getRefreshRate()
    );
  }
}

function stopPolling() {
  if (requestInterval != null) {
    global.clearInterval(requestInterval);
    requestInterval = null;
  }
}

function handleInactiveChange() {
  let isInactive = VisibilityStore.get('isInactive');
  if (isInactive) {
    stopPolling();
  }

  if (!isInactive && MarathonStore.shouldPoll()) {
    startPolling();
  }
}

VisibilityStore.addChangeListener(VISIBILITY_CHANGE, handleInactiveChange);

var MarathonStore = Store.createStore({
  storeID: 'marathon',

  mixins: [GetSetMixin],

  getSet_data: {
    apps: {},
    deployments: new DeploymentsList(),
    groups: new ServiceTree()
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);

    if (this.shouldPoll()) {
      startPolling();
    }
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  },

  shouldPoll: function () {
    return this.listenerCount(MARATHON_GROUPS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_DEPLOYMENTS_CHANGE) > 0 ||
      this.listenerCount(MARATHON_APPS_CHANGE) > 0;
  },

  fetchServiceVersion: MarathonActions.fetchServiceVersion,

  fetchServiceVersions: MarathonActions.fetchServiceVersions,

  hasProcessedApps: function () {
    return !!Object.keys(this.get('apps')).length;
  },

  getFrameworkHealth: function (app) {
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
  },

  getServiceHealth: function (name) {
    let appName = name.toLowerCase();
    let marathonApps = this.get('apps');

    if (!marathonApps[appName]) {
      return HealthStatus.NA;
    }

    return marathonApps[appName].health;
  },

  getServiceImages: function (name) {
    let appName = name.toLowerCase();
    let appImages = null;
    let marathonApps = this.get('apps');

    if (marathonApps[appName]) {
      appImages = marathonApps[appName].images;
    }

    return appImages;
  },

  getServiceInstalledTime: function (name) {
    let appName = name.toLowerCase();
    let appInstalledTime = null;
    let marathonApps = this.get('apps');

    if (marathonApps[appName]) {
      appInstalledTime = marathonApps[appName].snapshot.version;
    }

    return appInstalledTime;
  },

  getServiceVersion: function (name) {
    let appName = name.toLowerCase();
    let marathonApps = this.get('apps');

    if (marathonApps[appName]) {
      return this.getVersion(marathonApps[appName].snapshot);
    }

    return null;
  },

  getVersion: function (app) {
    if (app == null ||
      app.labels == null ||
      app.labels.DCOS_PACKAGE_VERSION == null) {
      return null;
    }

    return app.labels.DCOS_PACKAGE_VERSION;
  },

  getServiceFromName: function (name) {
    return this.get('apps')[name];
  },

  processMarathonGroups: function (data) {
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

    // Specific health check for Marathon
    // We are setting the 'marathon' key here, since we can safely assume,
    // it to be 'marathon' (we control it).
    // This means that no other framework should be named 'marathon'.
    apps.marathon = {
      health: this.getFrameworkHealth({
        // Make sure health check has a result
        healthChecks: [{}],
        // Marathon is healthy if this request returned apps
        tasksHealthy: data.apps.length,
        tasksRunning: data.apps.length
      }),
      images: ServiceImages.MARATHON_IMAGES
    };

    this.set({apps});
    this.set({groups});

    CompositeState.addMarathonApps(apps);

    this.emit(MARATHON_APPS_CHANGE, apps);
    this.emit(MARATHON_GROUPS_CHANGE, groups);
  },

  processMarathonGroupsError: function () {
    this.emit(MARATHON_APPS_ERROR);
    this.emit(MARATHON_GROUPS_ERROR);
  },

  processMarathonDeployments: function (data) {
    let deployments = new DeploymentsList({items: data});
    this.set({deployments});
    this.emit(MARATHON_DEPLOYMENTS_CHANGE, deployments);
  },

  processMarathonDeploymentsError: function () {
    this.emit(MARATHON_DEPLOYMENTS_ERROR);
  },

  processOngoingRequest: function () {
    // Handle ongoing request here.
  },

  processMarathonServiceVersions({serviceID, versions}) {
    versions = versions.reduce(function (map, version) {
      return map.set(version);
    }, new Map());

    this.emit(MARATHON_SERVICE_VERSIONS_CHANGE, {serviceID, versions});
  },

  processMarathonServiceVersionsError() {
    this.emit(MARATHON_SERVICE_VERSIONS_ERROR);
  },

  processMarathonServiceVersion({serviceID, version, versionID}) {
    // TODO (orlandohohmeier): Convert version into typed version struct
    this.emit(MARATHON_SERVICE_VERSION_CHANGE, {serviceID, versionID, version});
  },

  processMarathonServiceVersionError() {
    this.emit(MARATHON_SERVICE_VERSION_ERROR);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== ActionTypes.SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case ActionTypes.REQUEST_MARATHON_GROUPS_SUCCESS:
        MarathonStore.processMarathonGroups(action.data);
        break;
      case ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_SUCCESS:
        MarathonStore.processMarathonDeployments(action.data);
        break;
      case ActionTypes.REQUEST_MARATHON_GROUPS_ERROR:
        MarathonStore.processMarathonGroupsError();
        break;
      case ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_ERROR:
        MarathonStore.processMarathonDeploymentsError();
        break;
      case ActionTypes.REQUEST_MARATHON_GROUPS_ONGOING:
        MarathonStore.processOngoingRequest();
        break;
      case ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_SUCCESS:
        MarathonStore.processMarathonServiceVersion(action.data);
        break;
      case ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_ERROR:
        MarathonStore.processMarathonServiceVersionError();
        break;
      case ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS:
        MarathonStore.processMarathonServiceVersions(action.data);
        break;
      case ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_ERROR:
        MarathonStore.processMarathonServiceVersionsError();
        break;
    }

    return true;
  })

});

module.exports = MarathonStore;
