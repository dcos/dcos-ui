import {EventEmitter} from 'events';

import {
  DCOS_CHANGE,
  MESOS_SUMMARY_CHANGE,
  MARATHON_APPS_CHANGE
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

    this.data = {
      marathon: {
        apps: []
      },
      mesos: {
        frameworks: []
      }
    };

    this.proxyListeners = [
      {
        event: MARATHON_APPS_CHANGE,
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
   * @param {{apps:array}} data
   */
  processMarathonData(data) {
    if (data == null || !Array.isArray(data.apps)) {
      return;
    }

    this.data.marathon = data;
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
    // Only add listeners if not already listening
    if (!this.listeners(DCOS_CHANGE).length) {
      this.addProxyListeners();
    }

    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
    // Remove listeners if no one is listening
    if (this.listeners(DCOS_CHANGE).length) {
      this.removeProxyListeners();
    }
  }

  /**
   * @type {ServiceTree}
   */
  get serviceTree() {
    let {marathon, mesos} = this.data;

    let serviceTree = new ServiceTree(marathon);

    // Merge Mesos and Marathon data
    if (mesos.frameworks.length !== 0) {
      // Create framework dict from Mesos data
      let frameworks = mesos.frameworks
        .reduce(function (map, framework) {
          map[framework.name] = framework;

          return map;
        }, {});

      // Merge data by framework name, as  Marathon doesn't know framework ids.
      serviceTree = serviceTree.mapItems(function (item) {
        if (item instanceof Framework) {
          return new Framework(
            Object.assign({}, frameworks[item.getName()], item)
          );
        }

        return item;
      });
    }

    return serviceTree;
  }

  static get storeID() {
    return 'dcos';
  }
}

module.exports = new DCOSStore();
