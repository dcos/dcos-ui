import {EventEmitter} from 'events';

import {
  CHRONOS_JOBS_CHANGE,
  DCOS_CHANGE,
  MESOS_SUMMARY_CHANGE,
  MARATHON_GROUPS_CHANGE,
  MARATHON_QUEUE_CHANGE,
  MARATHON_SERVICE_VERSION_CHANGE,
  MARATHON_SERVICE_VERSIONS_CHANGE
} from '../constants/EventTypes';
import ChronosStore from '../stores/ChronosStore';
import Framework from '../structs/Framework';
import MarathonStore from './MarathonStore';
import MesosSummaryStore from './MesosSummaryStore';
import ServiceTree from '../structs/ServiceTree';
import SummaryList from '../structs/SummaryList';

const METHODS_TO_BIND = [
  'onChronosChange',
  'onMarathonGroupsChange',
  'onMarathonQueueChange',
  'onMarathonServiceVersionChange',
  'onMarathonServiceVersionsChange',
  'onMesosSummaryChange'
];

class DCOSStore extends EventEmitter {

  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.data = {
      marathon: {
        serviceTree: new ServiceTree(),
        queue: new Map(),
        versions: new Map()
      },
      mesos: new SummaryList(),
      dataProcessed: false
    };

    this.proxyListeners = [
      {
        event: CHRONOS_JOBS_CHANGE,
        handler: this.onChronosChange,
        store: ChronosStore
      },
      {
        event: MARATHON_GROUPS_CHANGE,
        handler: this.onMarathonGroupsChange,
        store: MarathonStore
      },
      {
        event: MARATHON_QUEUE_CHANGE,
        handler: this.onMarathonQueueChange,
        store: MarathonStore
      },
      {
        event: MARATHON_SERVICE_VERSION_CHANGE,
        handler: this.onMarathonServiceVersionChange,
        store: MarathonStore
      },
      {
        event: MARATHON_SERVICE_VERSIONS_CHANGE,
        handler: this.onMarathonServiceVersionsChange,
        store: MarathonStore
      },
      {
        event: MESOS_SUMMARY_CHANGE,
        handler: this.onMesosSummaryChange,
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

  onMarathonGroupsChange() {
    let serviceTree = MarathonStore.get('groups');
    if (!(serviceTree instanceof ServiceTree)) {
      return;
    }

    this.data.marathon.serviceTree = serviceTree;
    this.data.dataProcessed = true;
    this.emit(DCOS_CHANGE);
  }

  onMarathonQueueChange(nextQueue) {
    let {marathon:{queue}} = this.data;

    nextQueue.forEach((entry) => {
      if (entry.app == null) {
        return;
      }

      queue.set(entry.app.id, entry);
    });

    this.emit(DCOS_CHANGE);
  }

  onMarathonServiceVersionChange({serviceID, versionID, version}) {
    let {marathon:{versions}} = this.data;
    let currentVersions = versions.get(serviceID);

    if (!currentVersions) {
      currentVersions = new Map();
      versions.set(serviceID, currentVersions);
    }

    currentVersions.set(versionID, version);

    this.emit(DCOS_CHANGE);
  }

  onMarathonServiceVersionsChange({serviceID, versions:nextVersions}) {
    let {marathon:{versions}} = this.data;
    let currentVersions = versions.get(serviceID);

    if (currentVersions) {
      nextVersions = new Map([...nextVersions, ...currentVersions]);
    }

    versions.set(serviceID, nextVersions);
    this.emit(DCOS_CHANGE);
  }

  onMesosSummaryChange() {
    let states = MesosSummaryStore.get('states');
    if (!(states instanceof SummaryList)) {
      return;
    }

    this.data.mesos = states;
    this.emit(DCOS_CHANGE);
  }

  onChronosChange() {
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
   * @type {JobTree}
   */
  get jobTree() {
    return ChronosStore.jobTree;
  }

  /**
   * @type {ServiceTree}
   */
  get serviceTree() {
    let {marathon:{serviceTree, queue, versions}, mesos} = this.data;

    // Create framework dict from Mesos data
    let frameworks = mesos.lastSuccessful().getServiceList()
      .reduceItems(function (memo, framework) {
        memo[framework.name] = framework;

        return memo;
      }, {});

    // Merge data by framework name, as  Marathon doesn't know framework ids.
    return serviceTree.mapItems(function (item) {
      if (item instanceof ServiceTree) {
        return item;
      }
      let serviceId = item.getId();
      let options = {
        versions: versions.get(serviceId),
        queue: queue.get(serviceId)
      };

      if (item instanceof Framework) {
        options = Object.assign(options, frameworks[item.getName()]);
      }

      return new item.constructor(
        Object.assign(options, item)
      );
    });

  }

  get dataProcessed() {
    return this.data.dataProcessed;
  }

  get storeID() {
    return 'dcos';
  }
}

module.exports = new DCOSStore();
