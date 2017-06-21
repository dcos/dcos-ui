import deepEqual from "deep-equal";
import md5 from "md5";
import { hashHistory, match } from "react-router";

import RouterUtil from "../../../src/js/utils/RouterUtil";

const SDK = require("../SDK").getSDK();

const { Config, Util } = SDK.get(["Config", "Util"]);

var Actions = {
  previousFakePageLog: "",

  dcosMetadata: null,

  routes: null,

  logQueue: [],

  pageQueue: [],

  actions: ["log", "logFakePageView"],

  initialize() {
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });

    this.listenForDcosMetadata();
    this.start();
  },

  metadataLoaded() {
    const metadata = SDK.Store.getAppState().metadata;

    return (
      metadata &&
      metadata.dcosMetadata &&
      metadata.metadata &&
      metadata.metadata.CLUSTER_ID
    );
  },

  listenForDcosMetadata() {
    if (!this.metadataLoaded()) {
      const unSubscribe = SDK.Store.subscribe(() => {
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
    return Object.assign({}, SDK.Store.getAppState().metadata.dcosMetadata, {
      clusterId: SDK.Store.getAppState().metadata.metadata.CLUSTER_ID
    });
  },

  setDcosMetadata(metadata) {
    this.dcosMetadata = metadata;

    if (this.canLog()) {
      this.drainQueue();
    }
  },

  setRoutes(routes) {
    this.routes = routes;

    if (this.canLog()) {
      this.drainQueue();
    }
  },

  start() {
    this.createdAt = Date.now();
    this.lastLogDate = this.createdAt;
    this.stintID = md5(`session_${this.createdAt}`);

    hashHistory.listen(
      Util.debounce(function(location) {
        Actions.setActivePage(location.pathname + location.search);
      }, 200)
    );

    // Poll to deplete queue
    const checkAnalyticsReady = () => {
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
    return (
      global.analytics &&
      global.analytics.initialized &&
      this.dcosMetadata != null &&
      this.routes != null
    );
  },

  drainQueue() {
    this.logQueue.forEach(log => {
      this.log(log);
    });
    this.logQueue = [];

    this.pageQueue.forEach(path => {
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
    if (path[path.length - 1] === "/") {
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
    return Object.assign(
      {
        appVersion: Config.version,
        version: "@@VERSION"
      },
      this.dcosMetadata
    );
  },

  identify(uid) {
    if (!this.canLog()) {
      // Try again
      setTimeout(() => {
        this.identify(uid);
      }, 500);

      return;
    }

    if (!SDK.Hooks.applyFilter("shouldIdentifyLoggedInUser", true)) {
      return;
    }

    const traits = Object.assign(this.getLogData(), { email: uid });
    global.analytics.identify(uid, traits, this.getAnonymizingKeys());

    this.log("dcos_login");
  },

  logPage(path) {
    if (!this.canLog()) {
      this.pageQueue.push(path);

      return;
    }

    if (typeof path === "string") {
      match(
        { history: hashHistory, routes: this.routes },
        (error, redirectLocation, nextState) => {
          if (!error && nextState) {
            let pathMatcher = RouterUtil.reconstructPathFromRoutes(
              nextState.routes
            );
            if (nextState.params) {
              Object.keys(nextState.params).forEach(function(param) {
                pathMatcher = pathMatcher.replace(`:${param}?`, `[${param}]`);
                pathMatcher = pathMatcher.replace(`:${param}`, `[${param}]`);
              });
            }

            // Replaces '/?/' and '/?' with '/'
            path = pathMatcher.replace(/\/\?\/?/g, "/");
          } else {
            path = "/unknown";
          }

          this.submitToAnalytics(path);
        }
      );
    }

    this.submitToAnalytics(path);
  },

  submitToAnalytics(path) {
    global.analytics.page(
      Object.assign(this.getLogData(), this.getAnonymizingKeys().page, { path })
    );
  },

  /**
   * Logs arbitrary data
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
        referrer: "",
        url: "",
        path: "",
        title: ""
      }
    };
  }
};

module.exports = Actions;
