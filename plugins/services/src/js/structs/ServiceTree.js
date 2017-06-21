import Framework from "./Framework";
import HealthSorting from "../constants/HealthSorting";
import HealthStatus from "../constants/HealthStatus";
import List from "../../../../../src/js/structs/List";
import Pod from "./Pod";
import Service from "./Service";
import ServiceOther from "../constants/ServiceOther";
import ServiceStatus from "../constants/ServiceStatus";
import ServiceUtil from "../utils/ServiceUtil";
import Tree from "../../../../../src/js/structs/Tree";
import VolumeList from "../structs/VolumeList";

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

    this.id = "/";
    if (options.id || typeof options.id == "string") {
      this.id = options.id;
    }

    // Converts items into instances of ServiceTree, Application or Framework
    // based on their properties.
    this.list = this.list.map(item => {
      if (item instanceof ServiceTree || item instanceof Service) {
        return item;
      }

      // Check item properties and convert items with an items array (sub trees)
      // into ServiceTree instances.
      if (item.items != null && Array.isArray(item.items)) {
        return new this.constructor(
          Object.assign({ filterProperties: this.getFilterProperties() }, item)
        );
      }

      // Create the appropriate service according to definition
      return ServiceUtil.createServiceFromResponse(item);
    });
  }

  getDeployments() {
    return this.reduceItems(function(deployments, item) {
      if (item instanceof Service && item.getDeployments() != null) {
        deployments = deployments.concat(item.getDeployments());
      }

      return deployments;
    }, []);
  }

  getQueue() {
    return null;
  }

  getHealth() {
    return this.reduceItems(function(aggregatedHealth, item) {
      if (item instanceof Service) {
        const health = item.getHealth();
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

  getServiceFromTaskID(taskID) {
    return this.findServiceByName(ServiceUtil.getServiceNameFromTaskID(taskID));
  }

  getTaskFromTaskID(taskID) {
    const service = this.getServiceFromTaskID(taskID);

    if (service == null || service.tasks == null || !service.tasks.length) {
      return null;
    }

    return service.tasks.find(function(task) {
      return task.id === taskID;
    });
  }

  /**
   * @param {string} id
   * @return {Service|ServiceTree} matching item
   */
  findItemById(id) {
    if (this.getId() === id) {
      return this;
    }

    return this.findItem(function(item) {
      return item.getId() === id;
    });
  }

  /**
   * @param {string} name
   * @return {Service} matching Service
   */
  findServiceByName(name) {
    return this.findItem(function(item) {
      return item.getName() === name && item instanceof Service;
    });
  }

  // TODO @pierlo-upitup MARATHON-1030: refactor for more generic usage
  filterItemsByFilter(filter) {
    let services = this.getItems();

    if (filter) {
      if (filter.ids) {
        services = services.filter(
          function(service) {
            return this.ids.indexOf(service.id) !== -1;
          },
          { ids: filter.ids }
        );
      }

      if (filter.id) {
        const filterProperties = Object.assign({}, this.getFilterProperties(), {
          name(item) {
            return item.getName();
          }
        });

        services = this.flattenItems()
          .filterItemsByText(filter.id, filterProperties)
          .getItems();
      }

      if (Array.isArray(filter.health) && filter.health.length !== 0) {
        services = services.reduce(function(memo, service) {
          filter.health.forEach(function(healthValue) {
            if (service instanceof ServiceTree) {
              memo = memo.concat(
                service
                  .filterItemsByFilter({ health: [healthValue] })
                  .getItems()
              );

              return;
            }

            if (service.getHealth().value === parseInt(healthValue, 10)) {
              memo.push(service);
            }
          });

          return memo;
        }, []);
      }

      if (Array.isArray(filter.labels) && filter.labels.length > 0) {
        services = services.reduce(function(memo, service) {
          filter.labels.forEach(function(label) {
            if (service instanceof ServiceTree) {
              memo = memo.concat(
                service.filterItemsByFilter({ labels: [label] }).getItems()
              );

              return;
            }

            let serviceLabels = service.getLabels();

            if (service instanceof Service) {
              serviceLabels = ServiceUtil.convertServiceLabelsToArray(service);
            }

            const hasLabel = serviceLabels.some(function(serviceLabel) {
              return (
                serviceLabel.key === label.key &&
                serviceLabel.value === label.value
              );
            });

            if (hasLabel) {
              memo.push(service);
            }
          });

          return memo;
        }, []);
      }

      if (Array.isArray(filter.other) && filter.other.length !== 0) {
        services = services.reduce(function(memo, service) {
          filter.other.forEach(function(otherKey) {
            if (parseInt(otherKey, 10) === ServiceOther.UNIVERSE.key) {
              if (service instanceof ServiceTree) {
                memo = memo.concat(
                  service.filterItemsByFilter({ other: [otherKey] }).getItems()
                );
              }

              if (service instanceof Framework) {
                memo.push(service);
              }
            }

            if (parseInt(otherKey, 10) === ServiceOther.VOLUMES.key) {
              const volumes = service.getVolumes();

              if (volumes.list && volumes.list.length > 0) {
                memo.push(service);
              }
            }

            if (parseInt(otherKey, 10) === ServiceOther.PODS.key) {
              if (service instanceof ServiceTree) {
                memo = memo.concat(
                  service.filterItemsByFilter({ other: [otherKey] }).getItems()
                );
              }

              if (service instanceof Pod) {
                memo.push(service);
              }
            }
          });

          return memo;
        }, []);
      }

      if (Array.isArray(filter.status) && filter.status.length !== 0) {
        services = services.reduce(function(memo, service) {
          filter.status.some(function(statusValue) {
            if (service instanceof ServiceTree) {
              memo = memo.concat(
                service
                  .filterItemsByFilter({ status: [statusValue] })
                  .getItems()
              );

              return;
            }

            if (service.getServiceStatus().key === parseInt(statusValue, 10)) {
              memo.push(service);
            }
          });

          return memo;
        }, []);
      }
    }

    const { uniques } = services.reduce(
      function(memo, service) {
        if (!(service.getId() in memo.serviceIds)) {
          memo.serviceIds[service.getId()] = true;
          memo.uniques.push(service);
        }

        return memo;
      },
      { uniques: [], serviceIds: {} }
    );

    return new this.constructor(Object.assign({}, this, { items: uniques }));
  }

  getInstancesCount() {
    return this.reduceItems(function(instances, item) {
      if (item instanceof Service) {
        instances += item.getInstancesCount();
      }

      return instances;
    }, 0);
  }

  getName() {
    return this.getId().split("/").pop();
  }

  getResources() {
    return this.reduceItems(
      function(resources, item) {
        if (item instanceof Service) {
          const { cpus = 0, mem = 0, disk = 0 } = item.getResources();

          resources.cpus += cpus;
          resources.mem += mem;
          resources.disk += disk;
        }

        return resources;
      },
      { cpus: 0, mem: 0, disk: 0 }
    );
  }

  getStatus() {
    const status = this.getServiceStatus();
    if (status == null) {
      return null;
    }

    return status.displayName;
  }

  getServiceStatus() {
    return this.reduceItems(function(serviceTreeStatus, item) {
      if (item instanceof Service) {
        const status = item.getServiceStatus();
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
    const items = this.reduceItems(function(services, item) {
      if (item instanceof Service) {
        services.push(item);
      }

      return services;
    }, []);

    return new List({ items });
  }

  getTasksSummary() {
    return this.reduceItems(
      function(taskSummary, item) {
        if (item instanceof Service) {
          const {
            tasksHealthy = 0,
            tasksRunning = 0,
            tasksOverCapacity = 0,
            tasksStaged = 0,
            tasksUnhealthy = 0
          } = item.getTasksSummary();

          taskSummary.tasksHealthy += tasksHealthy;
          taskSummary.tasksRunning += tasksRunning;
          taskSummary.tasksStaged += tasksStaged;
          taskSummary.tasksUnhealthy += tasksUnhealthy;
          taskSummary.tasksUnknown +=
            tasksRunning - tasksHealthy - tasksUnhealthy;

          taskSummary.tasksOverCapacity += tasksOverCapacity;
        }

        return taskSummary;
      },
      {
        tasksHealthy: 0,
        tasksRunning: 0,
        tasksStaged: 0,
        tasksUnhealthy: 0,
        tasksUnknown: 0,
        tasksOverCapacity: 0
      }
    );
  }

  getFrameworks() {
    return this.reduceItems(function(frameworks, item) {
      if (item instanceof Framework) {
        frameworks.push(item);
      }

      return frameworks;
    }, []);
  }

  getVolumes() {
    const items = this.reduceItems(function(serviceTreeVolumes, item) {
      if (item instanceof Service) {
        const itemVolumes = item.getVolumes().getItems();
        if (itemVolumes && itemVolumes.length) {
          serviceTreeVolumes.push(itemVolumes);
        }
      }

      return serviceTreeVolumes;
    }, []);

    return new VolumeList({ items });
  }

  getLabels() {
    return this.reduceItems(function(serviceTreeLabels, item) {
      ServiceUtil.convertServiceLabelsToArray(item).forEach(function({
        key,
        value
      }) {
        if (
          serviceTreeLabels.findIndex(function(label) {
            return label.key === key && label.value === value;
          }) < 0
        ) {
          serviceTreeLabels = serviceTreeLabels.concat([{ key, value }]);
        }
      });

      return serviceTreeLabels;
    }, []);
  }
};
