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

const METHODS_TO_BIND = [
  'processMarathonData',
  'processMesosData'
];

class DCOSStore extends EventEmitter {

  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.serviceTreeOptions = {
      filterProperties: {
        name: function (item) {
          return item.id;
        }
      }
    };

    this.data = {
      marathon: new ServiceTree(this.serviceTreeOptions),
      mesos: {
        frameworks: []
      },
      dataProcessed: false
    };

    this.proxyListeners = [
      {
        event: MARATHON_GROUPS_CHANGE,
        handler: this.processMarathonData,
        store: MarathonStore
      },
      {
        event: MESOS_SUMMARY_CHANGE,
        handler: this.processMesosData,
        store: MesosSummaryStore
      }
    ];
  }

  /**
   * Process Marathon data
   * @param {ServiceTree} data
   */
  processMarathonData(data) {
    if (!(data instanceof ServiceTree)) {
      return;
    }

    this.data.marathon = data;
    this.data.dataProcessed = true;
    this.emit(DCOS_CHANGE);
  }

  /**
   * Process Mesos data
   * @param {{frameworks:array}} data
   */
  processMesosData(data) {
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
    let {marathon, mesos} = this.data;

    // Merge Mesos and Marathon data
    if (mesos.frameworks.length > 0) {
      // Create framework dict from Mesos data
      let frameworks = mesos.frameworks
        .reduce(function (map, framework) {
          map[framework.name] = framework;

          return map;
        }, {});

      // Merge data by framework name, as  Marathon doesn't know framework ids.
      return marathon.mapItems(function (item) {
        if (item instanceof Framework) {
          return new Framework(
            Object.assign({}, frameworks[item.getName()], item)
          );
        }

        return item;
      });
    }

    return marathon;
  }

  get dataProcessed() {
    return this.data.dataProcessed;
  }

  static get storeID() {
    return 'dcos';
  }
}

module.exports = new DCOSStore();
