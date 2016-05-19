import {EventEmitter} from 'events';

import {
  DCOS_CHANGE,
  MESOS_SUMMARY_CHANGE,
  MARATHON_GROUPS_CHANGE,
  MARATHON_SERVICE_VERSION_CHANGE,
  MARATHON_SERVICE_VERSIONS_CHANGE
} from '../constants/EventTypes';
import Framework from '../structs/Framework';
import MarathonStore from './MarathonStore';
import MesosSummaryStore from './MesosSummaryStore';
import ServiceTree from '../structs/ServiceTree';

const METHODS_TO_BIND = [
  'processMarathonGroups',
  'processMarathonServiceVersion',
  'processMarathonServiceVersions',
  'processMesosStateSummary'
];

class DCOSStore extends EventEmitter {

  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.data = {
      marathon: {
        tree: new ServiceTree(),
        versions: new Map()
      },
      mesos: {
        frameworks: []
      },
      dataProcessed: false
    };

    this.proxyListeners = [
      {
        event: MARATHON_GROUPS_CHANGE,
        handler: this.processMarathonGroups,
        store: MarathonStore
      },
      {
        event: MARATHON_SERVICE_VERSION_CHANGE,
        handler: this.processMarathonServiceVersion,
        store: MarathonStore
      },
      {
        event: MARATHON_SERVICE_VERSIONS_CHANGE,
        handler: this.processMarathonServiceVersions,
        store: MarathonStore
      },
      {
        event: MESOS_SUMMARY_CHANGE,
        handler: this.processMesosStateSummary,
        store: MesosSummaryStore
      }
    ];
  }

  /**
   * Fetch service version/configuration from Marathon
   * @param {string} serviceID
   * @param {string} versionID
   */
  fetchServiceVersion(serviceID, versionID) {
    MarathonStore.fetchServiceVersion(serviceID, versionID);
  }

  /**
   * Fetch service versions/configurations from Marathon
   * @param {string} serviceID
   */
  fetchServiceVersions(serviceID) {
    MarathonStore.fetchServiceVersions(serviceID);
  }

  /**
   * Process Marathon groups data
   * @param {ServiceTree} data
   */
  processMarathonGroups(data) {
    if (!(data instanceof ServiceTree)) {
      return;
    }

    this.data.marathon.tree = data;
    this.data.dataProcessed = true;
    this.emit(DCOS_CHANGE);
  }

  /**
   * Process Marathon service versions data
   * @param {string} serviceID
   * @param {Map} nextVersions
   */
  processMarathonServiceVersion({serviceID, versionID, version}) {
    let {marathon:{versions}} = this.data;
    let currentVersions = versions.get(serviceID);

    if (!currentVersions) {
      currentVersions = new Map();
      versions.set(serviceID, currentVersions);
    }

    currentVersions.set(versionID, version);

    this.emit(DCOS_CHANGE);
  }

  /**
   * Process Marathon service versions data
   * @param {string} serviceID
   * @param {Map} nextVersions
   */
  processMarathonServiceVersions({serviceID, versions:nextVersions}) {
    let {marathon:{versions}} = this.data;
    let currentVersions = versions.get(serviceID);

    if (currentVersions) {
      nextVersions = new Map([...nextVersions, ...currentVersions]);
    }

    versions.set(serviceID, nextVersions);
    this.emit(DCOS_CHANGE);
  }

  /**
   * Process Mesos state summary data
   * @param {{frameworks:array}} data
   */
  processMesosStateSummary(data) {
    if (data == null || !Array.isArray(data.frameworks)) {
      return;
    }
    this.data.mesos = data;
    this.data.dataProcessed = true;
    this.emit(DCOS_CHANGE);
  }

  addProxyListeners() {
    this.proxyListeners.forEach(function (item) {
      item.store.addChangeListener(item.event, item.handler);
    });
  }

  removeProxyListeners() {
    this.proxyListeners.forEach(function (item) {
      item.store.removeChangeListener(item.event, item.handler);
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  /**
   * Adds the listener for the specified event
   * @param {string} eventName
   * @param {Function} callback
   * @return {DCOSStore} DCOSStore instance
   * @override
   */
  on(eventName, callback) {
    // Only add proxy listeners if not already listening
    if (this.listeners().length === 0) {
      this.addProxyListeners();
    }

    return super.on(eventName, callback);
  }

  /**
   * Remove the specified listener for the specified event
   * @param {string} eventName
   * @param {Function} callback
   * @return {DCOSStore} DCOSStore instance
   * @override
   */
  removeListener(eventName, callback) {
    super.removeListener(eventName, callback);
    // Remove proxy listeners if no one is listening
    if (this.listeners().length === 0) {
      this.removeProxyListeners();
    }

    return this;
  }

  /**
   * @type {ServiceTree}
   */
  get serviceTree() {
    let {marathon:{tree, versions}, mesos:{frameworks}} = this.data;

    // TODO (orlandohohmeier): combine the two map item calls to improve perf.

    // Merge Mesos state summary and Marathon tree data
    if (frameworks.length > 0) {
      // Create framework dict from Mesos data
      frameworks = frameworks.reduce(function (map, framework) {
        map[framework.name] = framework;

        return map;
      }, {});

      // Merge data by framework name, as  Marathon doesn't know framework ids.
      tree = tree.mapItems(function (item) {
        if (item instanceof Framework) {
          return new Framework(
            Object.assign({}, frameworks[item.getName()], item)
          );
        }

        return item;
      });
    }

    // Merge service versions and Marathon tree data
    if (versions.size > 0) {
      tree = tree.mapItems(function (item) {
        if (item instanceof ServiceTree) {
          return item;
        }

        return new item.constructor(
          Object.assign({}, {versions: versions.get(item.getId())}, item)
        );
      });
    }

    return tree;
  }

  get dataProcessed() {
    return this.data.dataProcessed;
  }

  static get storeID() {
    return 'dcos';
  }
}

module.exports = new DCOSStore();
