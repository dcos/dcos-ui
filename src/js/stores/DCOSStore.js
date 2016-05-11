import {EventEmitter} from 'events';

import {
  DCOS_CHANGE,
  MESOS_SUMMARY_CHANGE,
  MARATHON_GROUPS_CHANGE
} from '../constants/EventTypes';
import Framework from '../structs/Framework';
import MarathonStore from './MarathonStore';
import MesosSummaryStore from './MesosSummaryStore';
import ServiceTree from '../structs/ServiceTree';
import SummaryList from '../structs/SummaryList';

const METHODS_TO_BIND = [
  'onMarathonGroupsChange',
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
        serviceTree: new ServiceTree()
      },
      mesos: new SummaryList(),
      dataProcessed: false
    };

    this.proxyListeners = [
      {
        event: MARATHON_GROUPS_CHANGE,
        handler: this.onMarathonGroupsChange,
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

  onMesosSummaryChange() {
    let states = MesosSummaryStore.get('states');
    if (!(states instanceof SummaryList)) {
      return;
    }

    this.data.mesos = states;
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
    let {marathon:{serviceTree}, mesos} = this.data;

    // Create framework dict from Mesos data
    let frameworks = mesos.lastSuccessful().getServiceList()
      .reduceItems(function (memo, framework) {
        memo[framework.name] = framework;

        return memo;
      }, {});

    // Merge data by framework name, as  Marathon doesn't know framework ids.
    return serviceTree.mapItems(function (item) {
      if (item instanceof Framework) {
        return new Framework(
          Object.assign({}, frameworks[item.getName()], item)
        );
      }

      return item;
    });

  }

  get dataProcessed() {
    return this.data.dataProcessed;
  }

  static get storeID() {
    return 'dcos';
  }
}

module.exports = new DCOSStore();
