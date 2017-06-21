import { EventEmitter } from "events";
import PluginSDK, { Hooks } from "PluginSDK";

import {
  METRONOME_JOBS_CHANGE,
  DCOS_CHANGE,
  MESOS_SUMMARY_CHANGE
} from "../../src/js/constants/EventTypes";
import {
  MARATHON_DEPLOYMENTS_CHANGE,
  MARATHON_GROUPS_CHANGE,
  MARATHON_QUEUE_CHANGE,
  MARATHON_SERVICE_VERSION_CHANGE,
  MARATHON_SERVICE_VERSIONS_CHANGE
} from "../../plugins/services/src/js/constants/EventTypes";

import DeclinedOffersUtil
  from "../../plugins/services/src/js/utils/DeclinedOffersUtil";
import DeploymentsList
  from "../../plugins/services/src/js/structs/DeploymentsList";
import Item from "../../src/js/structs/Item";
import Framework from "../../plugins/services/src/js/structs/Framework";
import JobTree from "../../src/js/structs/JobTree";
import MarathonStore from "../../plugins/services/src/js/stores/MarathonStore";
import MesosSummaryStore from "../../src/js/stores/MesosSummaryStore";
import MetronomeStore from "../../src/js/stores/MetronomeStore";
import NotificationStore from "../../src/js/stores/NotificationStore";
import ServiceTree from "../../plugins/services/src/js/structs/ServiceTree";
import SummaryList from "../../src/js/structs/SummaryList";

const METHODS_TO_BIND = [
  "onMetronomeChange",
  "onMarathonGroupsChange",
  "onMarathonQueueChange",
  "onMarathonDeploymentsChange",
  "onMarathonServiceVersionChange",
  "onMarathonServiceVersionsChange",
  "onMesosSummaryChange"
];

const EVENT_DEBOUNCE_TIME = 250;

class DCOSStore extends EventEmitter {
  constructor() {
    super(...arguments);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: this.getEvents(),
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.data = {
      marathon: {
        serviceTree: new ServiceTree(),
        queue: new Map(),
        deploymentsList: new DeploymentsList(),
        versions: new Map(),
        dataReceived: false
      },
      metronome: {
        jobTree: new JobTree(),
        dataReceived: false
      },
      mesos: new SummaryList()
    };

    this.debouncedEvents = new Map();
  }

  getEvents() {
    return { change: DCOS_CHANGE };
  }

  getTotalListenerCount() {
    return Object.values(this.getEvents()).reduce((memo, name) => {
      return memo + this.listeners(name).length;
    }, 0);
  }

  getProxyListeners() {
    let proxyListeners = [];

    if (Hooks.applyFilter("hasCapability", false, "metronomeAPI")) {
      proxyListeners.push({
        event: METRONOME_JOBS_CHANGE,
        handler: this.onMetronomeChange,
        store: MetronomeStore
      });
    }

    if (Hooks.applyFilter("hasCapability", false, "mesosAPI")) {
      proxyListeners.push({
        event: MESOS_SUMMARY_CHANGE,
        handler: this.onMesosSummaryChange,
        store: MesosSummaryStore
      });
    }

    if (Hooks.applyFilter("hasCapability", false, "marathonAPI")) {
      proxyListeners = proxyListeners.concat([
        {
          event: MARATHON_DEPLOYMENTS_CHANGE,
          handler: this.onMarathonDeploymentsChange,
          store: MarathonStore
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
        }
      ]);
    }

    return proxyListeners;
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

  onMarathonDeploymentsChange() {
    if (!this.data.marathon.dataReceived) {
      return;
    }
    const deploymentsList = MarathonStore.get("deployments");
    const serviceTree = MarathonStore.get("groups");

    const deploymentListLength = deploymentsList.getItems().length;
    const currentDeploymentCount = NotificationStore.getNotificationCount(
      "services-deployments"
    );

    if (deploymentListLength !== currentDeploymentCount) {
      NotificationStore.addNotification(
        "services-deployments",
        "deployment-count",
        deploymentListLength
      );
    }

    // Populate deployments with affected services
    this.data.marathon.deploymentsList = deploymentsList.mapItems(function(
      deployment
    ) {
      const ids = deployment.getAffectedServiceIds();
      const services = ids.reduce(
        function(memo, id) {
          const service = serviceTree.findItemById(id);
          if (service != null) {
            memo.affected.push(service);
          } else {
            memo.stale.push(id);
          }

          return memo;
        },
        { affected: [], stale: [] }
      );

      return Object.assign(
        {
          affectedServices: services.affected,
          staleServiceIds: services.stale
        },
        deployment
      );
    });

    this.emit(DCOS_CHANGE);
  }

  emit(eventType) {
    // Debounce specified events
    if ([DCOS_CHANGE].includes(eventType)) {
      clearTimeout(this.debouncedEvents.get(eventType));
      this.debouncedEvents.set(
        eventType,
        setTimeout(super.emit.bind(this, ...arguments), EVENT_DEBOUNCE_TIME)
      );

      return;
    }

    super.emit(eventType);
  }

  onMarathonGroupsChange() {
    const serviceTree = MarathonStore.get("groups");
    if (!(serviceTree instanceof ServiceTree)) {
      return;
    }

    const { marathon } = this.data;

    // Update service tree and data received flag
    marathon.serviceTree = serviceTree;
    marathon.dataReceived = true;

    // Populate deployments with services data immediately
    this.onMarathonDeploymentsChange();

    this.emit(DCOS_CHANGE);
  }

  onMarathonQueueChange(nextQueue) {
    const { marathon: { queue } } = this.data;

    const queuedAppIDs = [];
    nextQueue.forEach(entry => {
      if (entry.app == null && entry.pod == null) {
        return;
      }

      let id = null;

      if (entry.pod != null) {
        id = entry.pod.id;
      } else {
        id = entry.app.id;
      }

      entry.declinedOffers = {
        summary: DeclinedOffersUtil.getSummaryFromQueue(entry),
        offers: DeclinedOffersUtil.getOffersFromQueue(entry)
      };

      queuedAppIDs.push(id);
      queue.set(id, entry);
    });

    queue.forEach(entry => {
      let id = null;

      if (entry.pod != null) {
        id = entry.pod.id;
      } else {
        id = entry.app.id;
      }

      if (queuedAppIDs.indexOf(id) === -1) {
        queue.delete(id);
      }
    });

    this.emit(DCOS_CHANGE);
  }

  onMarathonServiceVersionChange(event) {
    const { serviceID, versionID, version } = event;
    const { marathon: { versions } } = this.data;
    let currentVersions = versions.get(serviceID);

    if (!currentVersions) {
      currentVersions = new Map();
      versions.set(serviceID, currentVersions);
    }

    currentVersions.set(versionID, version);

    this.emit(DCOS_CHANGE);
  }

  onMarathonServiceVersionsChange(event) {
    let { serviceID, versions: nextVersions } = event;
    const { marathon: { versions } } = this.data;
    const currentVersions = versions.get(serviceID);

    if (currentVersions) {
      nextVersions = new Map([...nextVersions, ...currentVersions]);
    }

    versions.set(serviceID, nextVersions);
    this.emit(DCOS_CHANGE);
  }

  onMesosSummaryChange() {
    const states = MesosSummaryStore.get("states");
    if (!(states instanceof SummaryList)) {
      return;
    }

    this.data.mesos = states;
    this.emit(DCOS_CHANGE);
  }

  onMetronomeChange() {
    const { metronome } = this.data;

    // Update job tree and data received flag
    metronome.jobTree = MetronomeStore.jobTree;
    metronome.dataReceived = true;

    this.emit(DCOS_CHANGE);
  }

  addProxyListeners() {
    this.getProxyListeners().forEach(function(item) {
      item.store.addChangeListener(item.event, item.handler);
    });
  }

  removeProxyListeners() {
    this.getProxyListeners().forEach(function(item) {
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
    if (this.getTotalListenerCount() === 0) {
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
    if (this.getTotalListenerCount() === 0) {
      this.removeProxyListeners();
    }

    return this;
  }

  /**
   * @type {JobTree}
   */
  get jobTree() {
    return this.data.metronome.jobTree;
  }

  /**
   * @type {DeploymentsList}
   */
  get deploymentsList() {
    return this.data.marathon.deploymentsList;
  }

  /**
   * @type {ServiceTree}
   */
  get serviceTree() {
    const { marathon: { serviceTree, queue, versions }, mesos } = this.data;

    // Create framework dict from Mesos data
    const frameworks = mesos
      .lastSuccessful()
      .getServiceList()
      .reduceItems(function(memo, framework) {
        if (framework instanceof Item) {
          memo[framework.get("name")] = framework.get();
        }

        return memo;
      }, {});

    // Merge data by framework name, as  Marathon doesn't know framework ids.
    return serviceTree.mapItems(function(item) {
      if (item instanceof ServiceTree) {
        return item;
      }

      const serviceId = item.getId();
      let options = {
        versions: versions.get(serviceId),
        queue: queue.get(serviceId)
      };

      if (item instanceof Framework) {
        options = Object.assign(options, frameworks[item.getName()]);
      }

      if (item instanceof Item) {
        return new item.constructor(Object.assign(options, item.get()));
      }

      return new item.constructor(Object.assign(options, item));
    });
  }

  get jobDataReceived() {
    return this.data.metronome.dataReceived;
  }

  get serviceDataReceived() {
    return this.data.marathon.dataReceived;
  }

  get storeID() {
    return "dcos";
  }
}

module.exports = new DCOSStore();
