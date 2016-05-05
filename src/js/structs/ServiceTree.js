import Application from './Application';
import Framework from './Framework';
import HealthSorting from '../constants/HealthSorting';
import HealthStatus from '../constants/HealthStatus';
import Service from './Service';
import ServiceStatus from '../constants/ServiceStatus';
import Tree from './Tree';
import Util from '../utils/Util';

module.exports = class ServiceTree extends Tree {
  /**
   * (Marathon) ServiceTree
   * @param {{
   *          id:string,
   *          items:array<({id:string, items:array}|*)>,
   *          groups:array<({id:string, groups:array, apps:array}|*)>,
   *          apps:array,
   *          filterProperties:{propertyName:(null|string|function)}
   *        }} options
   * @constructor
   * @struct
   */
  constructor(options = {}) {
    super(options);

    this.id = '/';
    if (options.id || typeof options.id == 'string') {
      this.id = options.id;
    }

    // Append Marathon groups
    if (options.groups) {
      this.list = this.list.concat(options.groups);
    }

    // Append applications
    if (options.apps) {
      this.list = this.list.concat(options.apps);
    }

    // Converts items into instances of ServiceTree, Application or Framework
    // based on their properties.
    this.list = this.list.map((item) => {
      if (item instanceof ServiceTree) {
        return item;
      }

      // Check item properties and convert items with an items array or an apps
      // and groups array (Marathon group structure) into ServiceTree instances.
      if ((item.items != null && Util.isArray(item.items)) ||
          (item.groups != null && Util.isArray(item.groups) &&
          item.apps != null && Util.isArray(item.apps))) {
        return new this.constructor(
          Object.assign({filterProperties: this.getFilterProperties()}, item)
        );
      }

      // Check the DCOS_PACKAGE_FRAMEWORK_NAME label to determine if the item
      // should be converted to an Application or Framework instance.
      if (item.labels && item.labels.DCOS_PACKAGE_FRAMEWORK_NAME) {
        return new Framework(item);
      } else {
        return new Application(item);
      }
    });
  }

  getDeployments() {
    return this.reduceItems(function (deployments, item) {
      if (item instanceof Service && item.getDeployments() != null) {
        deployments = deployments.concat(item.getDeployments());
      }

      return deployments;
    }, []);
  }

  getHealth() {
    return this.reduceItems(function (aggregatedHealth, item) {
      if (item instanceof Service) {
        let health = item.getHealth();
        if (HealthSorting[aggregatedHealth.key] > HealthSorting[health.key]) {
          aggregatedHealth = health;
        }
      }

      return aggregatedHealth;
    }, HealthStatus.NA);
  }

  getId() {
    return this.id;
  }

  /**
   * @param {string} id
   * @return {Service|ServiceTree} matching item
   */
  findItemById(id) {
    return this.findItem(function (item) {
      return item.getId() === id;
    });
  }

  getInstancesCount() {
    return this.reduceItems(function (instances, item) {
      if (item instanceof Service) {
        instances += item.getInstancesCount();
      }

      return instances;
    }, 0);
  }

  getName() {
    return this.getId().split('/').pop();
  }

  getResources() {
    return this.reduceItems(function (resources, item) {
      if (item instanceof Service) {
        let {cpus = 0, mem = 0, disk = 0} = item.getResources();

        resources.cpus += cpus;
        resources.mem += mem;
        resources.disk += disk;
      }

      return resources;
    }, {cpus: 0, mem: 0, disk: 0});
  }

  getStatus() {
    let {tasksRunning} = this.getTasksSummary();
    let deployments = this.getDeployments();

    if (deployments.length > 0) {
      return ServiceStatus.DEPLOYING.displayName;
    }

    if (tasksRunning > 0) {
      return ServiceStatus.RUNNING.displayName;
    }

    let instances = this.getInstancesCount();
    if (instances === 0) {
      return ServiceStatus.SUSPENDED.displayName;
    }

  }

  getTasksSummary() {
    return this.reduceItems(function (taskSummary, item) {
      if (item instanceof Service) {
        let {
          tasksHealthy = 0,
          tasksRunning = 0,
          tasksStaged = 0,
          tasksUnhealthy = 0
        } = item.getTasksSummary();

        taskSummary.tasksHealthy += tasksHealthy;
        taskSummary.tasksRunning += tasksRunning;
        taskSummary.tasksStaged += tasksStaged;
        taskSummary.tasksUnhealthy += tasksUnhealthy;
        taskSummary.tasksUnknown += tasksRunning -
          tasksHealthy - tasksUnhealthy;
      }

      return taskSummary;
    }, {tasksHealthy: 0, tasksRunning: 0, tasksStaged: 0, tasksUnhealthy: 0,
      tasksUnknown: 0});
  }
};
