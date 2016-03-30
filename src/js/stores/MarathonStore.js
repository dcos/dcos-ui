var _ = require('underscore');
import {Store} from 'mesosphere-shared-reactjs';

var AppDispatcher = require('../events/AppDispatcher');
import ActionTypes from '../constants/ActionTypes';
import CompositeState from '../structs/CompositeState';
var Config = require('../config/Config');
import {
  MARATHON_APPS_CHANGE,
  MARATHON_APPS_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
var GetSetMixin = require('../mixins/GetSetMixin');
var HealthStatus = require('../constants/HealthStatus');
var MarathonActions = require('../events/MarathonActions');
var ServiceImages = require('../constants/ServiceImages');
import FrameworkUtil from '../utils/FrameworkUtil';
import VisibilityStore from './VisibilityStore';

var requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    MarathonActions.fetchGroups();
    requestInterval = global.setInterval(
      MarathonActions.fetchGroups, Config.getRefreshRate()
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
    apps: {}
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
    return !_.isEmpty(this.listeners(MARATHON_APPS_CHANGE));
  },

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
    let marathonGroups = this.get('apps');

    if (!marathonGroups[appName]) {
      return HealthStatus.NA;
    }

    return marathonGroups[appName].health;
  },

  getServiceImages: function (name) {
    let appName = name.toLowerCase();
    let appImages = null;
    let marathonGroups = this.get('apps');

    if (marathonGroups[appName]) {
      appImages = marathonGroups[appName].images;
    }

    return appImages;
  },

  getServiceInstalledTime: function (name) {
    let appName = name.toLowerCase();
    let appInstalledTime = null;
    let marathonGroups = this.get('apps');

    if (marathonGroups[appName]) {
      appInstalledTime = marathonGroups[appName].snapshot.version;
    }

    return appInstalledTime;
  },

  getServiceVersion: function (name) {
    let appName = name.toLowerCase();
    let marathonGroups = this.get('apps');

    if (marathonGroups[appName]) {
      return this.getVersion(marathonGroups[appName].snapshot);
    }

    return null;
  },

  getFrameworkImages: function (app) {
    return FrameworkUtil.getServiceImages(
      FrameworkUtil.getMetadataFromLabels(app.labels).images
    );
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
    var apps = {};

    _.each(data.apps, function (app) {
      if (app.labels == null || app.labels.DCOS_PACKAGE_FRAMEWORK_NAME == null) {
        return;
      }

      var packageName = app.labels.DCOS_PACKAGE_FRAMEWORK_NAME;

      // Use insensitive check
      if (packageName.length) {
        packageName = packageName.toLowerCase();
      }

      apps[packageName] = {
        health: this.getFrameworkHealth(app),
        images: this.getFrameworkImages(app),
        snapshot: app
      };
    }, this);

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

    CompositeState.addMarathonGroups(apps);

    this.emit(MARATHON_APPS_CHANGE, this.get('apps'));
  },

  processMarathonGroupsError: function () {
    this.emit(MARATHON_APPS_ERROR);
  },

  processOngoingRequest: function () {
    // Handle ongoing request here.
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
      case ActionTypes.REQUEST_MARATHON_GROUPS_ERROR:
        MarathonStore.processMarathonGroupsError();
        break;
      case ActionTypes.REQUEST_MARATHON_GROUPS_ONGOING:
        MarathonStore.processOngoingRequest();
        break;
    }

    return true;
  })

});

module.exports = MarathonStore;
