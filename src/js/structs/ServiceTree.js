import Application from './Application';
import Framework from './Framework';
import HealthSorting from '../constants/HealthSorting';
import HealthStatus from '../constants/HealthStatus';
import Service from './Service';
import ServiceStatus from '../constants/ServiceStatus';
import Tree from './Tree';

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

    // Converts items into instances of ServiceTree, Application or Framework
    // based on their properties.
    this.list = this.list.map((item) => {
      if (item instanceof ServiceTree) {
        return item;
      }

      // Check item properties and convert items with an items array (sub trees)
      // into ServiceTree instances.
      if ((item.items != null && Array.isArray(item.items))) {
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

  // TODO @pierlo-upitup MARATHON-1030: refactor for more generic usage
  filterItemsByFilter(filter) {
    let services = this.getItems();

    if (filter) {
      if (filter.ids) {
        services = services.filter(function (service) {
          return this.ids.indexOf(service.id) !== -1;
        }, {ids: filter.ids});
      }

      if (filter.id) {
        let filterProperties = Object.assign({}, this.getFilterProperties(), {
          name: function (item) {
            return item.getId();
          }
        });

        services = this.filterItemsByText(filter.id, filterProperties).getItems();
      }

      if (filter.health != null && filter.health.length !== 0) {
        services = services.filter(function (service) {
          return filter.health.some(function (healthValue) {
            return service.getHealth().value === parseInt(healthValue, 10);
          });
        });
      }

      if (filter.status != null && filter.status.length !== 0) {
        services = services.filter(function (service) {
          return filter.status.some(function (statusValue) {
            return service.getServiceStatus().key === parseInt(statusValue, 10);
          });
        });
      }
    }

    return new this.constructor(Object.assign({}, this, {items: services}));
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
    let status = this.getServiceStatus();
    if (status == null) {
      return null;
    }

    return status.displayName;
  }

  getServiceStatus() {
    let {tasksRunning} = this.getTasksSummary();
    let deployments = this.getDeployments();

    if (deployments.length > 0) {
      return ServiceStatus.DEPLOYING;
    }

    if (tasksRunning > 0) {
      return ServiceStatus.RUNNING;
    }

    let instances = this.getInstancesCount();
    if (instances === 0) {
      return ServiceStatus.SUSPENDED;
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
