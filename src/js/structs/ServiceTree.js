import Application from './Application';
import Framework from './Framework';
import HealthSorting from '../constants/HealthSorting';
import HealthStatus from '../constants/HealthStatus';
import List from './List';
import Service from './Service';
import ServiceOther from '../constants/ServiceOther';
import ServiceStatus from '../constants/ServiceStatus';
import ServiceUtil from '../utils/ServiceUtil';
import Tree from './Tree';
import VolumeList from '../structs/VolumeList';

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

      if (filter.labels != null && filter.labels.length > 0) {
        services = services.filter(function (service) {
          return filter.labels.some(function (label) {
            let serviceLabels = service.getLabels();

            if (service instanceof Service) {
              serviceLabels = ServiceUtil.convertServiceLabelsToArray(
                service
              );
            }

            return serviceLabels.some(function (serviceLabel) {
              return serviceLabel.key === label[0] &&
                serviceLabel.value === label[1];
            });
          });
        });
      }

      if (filter.other != null && filter.other.length !== 0) {
        services = services.filter(function (service) {
          return filter.other.some(function (otherKey) {

            if (parseInt(otherKey, 10) === ServiceOther.UNIVERSE.key) {
              if (service instanceof ServiceTree) {
                return service.getFrameworks().length > 0;
              }

              return service instanceof Framework;
            }

            if (parseInt(otherKey, 10) === ServiceOther.VOLUMES.key) {
              let volumes = service.getVolumes();

              return volumes.list && volumes.list.length > 0;
            }
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
    return this.reduceItems(function (serviceTreeStatus, item) {
      if (item instanceof Service) {
        let status = item.getServiceStatus();
        if (status == null) {
          return serviceTreeStatus;
        }

        if (status.key > serviceTreeStatus.key) {
          serviceTreeStatus = status;
        }
      }
      return serviceTreeStatus;
    }, ServiceStatus.NA);
  }

  getServices() {
    let items = this.reduceItems(function (services, item) {
      if (item instanceof Service) {
        services.push(item);
      }

      return services;
    }, []);

    return new List({items});
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

  getFrameworks() {
    return this.reduceItems(function (frameworks, item) {
      if (item instanceof Framework) {
        frameworks.push(item);
      }

      return frameworks;
    }, []);
  }

  getVolumes() {
    let items = this.reduceItems(function (serviceTreeVolumes, item) {
      if (item instanceof Service) {
        let itemVolumes = item.getVolumes().getItems();
        if (itemVolumes && itemVolumes.length) {
          serviceTreeVolumes.push(itemVolumes);
        }
      }

      return serviceTreeVolumes;
    }, []);

    return new VolumeList({items});
  }

  getLabels() {
    return this.reduceItems(function (serviceTreeLabels, item) {
      ServiceUtil.convertServiceLabelsToArray(item)
        .forEach(function ({key, value}) {
          if (0 > serviceTreeLabels.findIndex(function (label) {
            return label.key === key && label.value === value;
          })) {
            serviceTreeLabels = serviceTreeLabels.concat([{key, value}]);
          }
        });
      return serviceTreeLabels;
    }, []);
  }
};
