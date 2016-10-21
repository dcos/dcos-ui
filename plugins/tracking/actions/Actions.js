import deepEqual from 'deep-equal';
import md5 from 'md5';
import {hashHistory} from 'react-router';

let SDK = require('../SDK').getSDK();

let {Config, Util} = SDK.get(['Config', 'Util']);

var Actions = {
  previousFakePageLog: '',

  dcosMetadata: null,

  applicationRouter: null,

  logQueue: [],

  pageQueue: [],

  actions: [
    'log',
    'logFakePageView'
  ],

  initialize() {
    this.actions.forEach((action) => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });

    this.listenForDcosMetadata();
    this.start();
  },

  metadataLoaded() {
    let metadata = SDK.Store.getAppState().metadata;
    return (metadata &&
      metadata.dcosMetadata &&
      metadata.metadata &&
      metadata.metadata.CLUSTER_ID);
  },

  listenForDcosMetadata() {
    if (!this.metadataLoaded()) {
      let unSubscribe = SDK.Store.subscribe(() => {
        if (this.metadataLoaded()) {
          unSubscribe();
          this.setDcosMetadata(this.mergeMetaData());
        }
      });
    } else {
      this.setDcosMetadata(this.mergeMetaData());
    }
  },

  mergeMetaData() {
    return Object.assign({}, SDK.Store.getAppState().metadata.dcosMetadata,
      {clusterId: SDK.Store.getAppState().metadata.metadata.CLUSTER_ID});
  },

  setDcosMetadata(metadata) {
    this.dcosMetadata = metadata;

    if (this.canLog()) {
      this.drainQueue();
    }
  },

  setApplicationRouter(applicationRouter) {
    this.applicationRouter = applicationRouter;

    if (this.canLog()) {
      this.drainQueue();
    }
  },

  start() {
    this.createdAt = Date.now();
    this.lastLogDate = this.createdAt;
    this.stintID = md5(`session_${this.createdAt}`);

    this.setActivePage(hashHistory.location || '');

    hashHistory.listen(Util.debounce(function (data) {
      Actions.setActivePage(data.pathname);
    }, 200));

    // Poll to deplete queue
    let checkAnalyticsReady = () => {
      setTimeout(() => {
        if (!this.canLog()) {
          checkAnalyticsReady();
        } else {
          this.drainQueue();
        }
      }, 200);
    };
    checkAnalyticsReady();
  },

  canLog() {
    return !!(global.analytics
      && global.analytics.initialized
      && this.dcosMetadata != null
      && this.applicationRouter != null);
  },

  drainQueue() {
    this.logQueue.forEach((log) => {
      this.log(log);
    });
    this.logQueue = [];

    this.pageQueue.forEach((path) => {
      this.logPage(path);
    });
    this.pageQueue = [];
  },

  logFakePageView(fakePageLog) {
    if (!this.canLog()) {
      this.logQueue.push(fakePageLog);
      return;
    }

    if (deepEqual(this.previousFakePageLog, fakePageLog)) {
      return;
    }

    this.logPage(fakePageLog);
    this.previousFakePageLog = fakePageLog;
  },

  setActivePage(path) {
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length - 1);
    }

    if (!this.canLog()) {
      this.pageQueue.push(path);
      return;
    }

    this.logPage(path);
  },

  getStintID() {
    return this.stintID;
  },

  getLogData() {
    return Object.assign({
      appVersion: Config.version,
      version: '@@VERSION'
    }, this.dcosMetadata);
  },

  identify(uid) {
    if (!this.canLog()) {
      // Try again
      setTimeout(() => {
        this.identify(uid);
      }, 500);

      return;
    }

    if (!SDK.Hooks.applyFilter('shouldIdentifyLoggedInUser', true)) {
      return;
    }

    let traits = Object.assign(this.getLogData(), {email: uid});
    global.analytics.identify(
      uid, traits, this.getAnonymizingKeys()
    );

    this.log('dcos_login');
  },

  logPage(path) {
    if (!this.canLog()) {
      this.pageQueue.push(path);
      return;
    }

    let pathIsString = typeof path === 'string';
    let match = pathIsString && this.applicationRouter.match(path);
    if (match) {
      let route = match.routes[match.routes.length - 1];
      let pathMatcher = route.path;

      if (route.paramNames && route.paramNames.length) {
        route.paramNames.forEach(function (param) {
          pathMatcher = pathMatcher.replace(`:${param}?`, `[${param}]`);
          pathMatcher = pathMatcher.replace(`:${param}`, `[${param}]`);
        });
      }

      // Replaces '/?/' and '/?' with '/'
      path = pathMatcher.replace(/\/\?\/?/g, '/');
    } else if (pathIsString) {
      path = '/unknown';
    }

    global.analytics.page(Object.assign(
      this.getLogData(),
      this.getAnonymizingKeys().page,
      {path}
    ));
  },

  /**
   * Logs arbitriary data
   * @param  {String} eventID
   */
  log(eventID) {
    if (!this.canLog()) {
      this.logQueue.push(eventID);
      return;
    }

    // Populates with basic data that all logs need
    var log = this.getLogData();

    global.analytics.track(eventID, log, this.getAnonymizingKeys());
  },

  getAnonymizingKeys() {
    return {
      page: {
        // Anonymize
        referrer: '',
        url: '',
        path: '',
        title: ''
      }
    };
  }

};

module.exports = Actions;
