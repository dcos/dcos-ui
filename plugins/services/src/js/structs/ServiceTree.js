import List from "#SRC/js/structs/List";
import Tree from "#SRC/js/structs/Tree";

import Application from "./Application";
import Framework from "./Framework";
import HealthTypes from "../constants/HealthTypes";
import HealthStatus from "../constants/HealthStatus";
import Pod from "./Pod";
import Service from "./Service";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceUtil from "../utils/ServiceUtil";
import ServiceValidatorUtil from "../utils/ServiceValidatorUtil";
import VolumeList from "../structs/VolumeList";

export default class ServiceTree extends Tree {
  /*
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
    if (
      options.enforceRole !== undefined &&
      typeof options.enforceRole === "boolean"
    ) {
      this.enforceRole = options.enforceRole;
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
        return new this.constructor({
          filterProperties: this.getFilterProperties(),
          ...item
        });
      }

      // Create the appropriate service according to definition
      if (ServiceValidatorUtil.isPodResponse(item)) {
        return new Pod(item);
      }

      if (ServiceValidatorUtil.isFrameworkResponse(item)) {
        return new Framework(item);
      }

      if (ServiceValidatorUtil.isApplicationResponse(item)) {
        return new Application(item);
      }

      throw Error("Unknown service response: " + JSON.stringify(item));
    });
  }

  getDeployments() {
    return this.reduceItems((deployments, item) => {
      if (item instanceof Service && item.getDeployments() != null) {
        deployments = deployments.concat(item.getDeployments());
      }

      return deployments;
    }, []);
  }

  getQueue() {
    return null;
  }

  getRegions() {
    return [];
  }

  getHealth() {
    return this.reduceItems((aggregatedHealth, item) => {
      if (item instanceof Service) {
        const health = item.getHealth();
        if (HealthTypes[aggregatedHealth.key] > HealthTypes[health.key]) {
          aggregatedHealth = health;
        }
      }

      return aggregatedHealth;
    }, HealthStatus.NA);
  }

  getId() {
    return this.id;
  }

  getEnforceRole() {
    return this.enforceRole;
  }

  getServiceFromTaskID(taskID) {
    return this.findItemById(ServiceUtil.getServiceIDFromTaskID(taskID));
  }

  getTaskFromTaskID(taskID) {
    const service = this.getServiceFromTaskID(taskID);

    if (service == null || service.tasks == null || !service.tasks.length) {
      return null;
    }

    return service.tasks.find(task => task.id === taskID);
  }

  getItemParent(id, parent = null) {
    if (this.getId() === id) {
      return parent;
    }

    if (!this.list || this.list.length === 0) {
      return null;
    }

    let parentFound = null;

    for (let i = 0; i < this.list.length; i++) {
      const child = this.list[i];
      if (child instanceof ServiceTree) {
        parentFound = child.getItemParent(id, this);
      } else if (child.getId() === id) {
        parentFound = this;

        break;
      }
    }

    return parentFound;
  }

  /**
   * @param {string} id
   * @return {Service|ServiceTree} matching item
   */
  findItemById(id) {
    if (this.getId() === id) {
      return this;
    }

    return this.findItem(item => item.getId() === id);
  }

  getInstancesCount() {
    return this.reduceItems((instances, item) => {
      if (item instanceof Service) {
        instances += item.getInstancesCount();
      }

      return instances;
    }, 0);
  }

  getStatusCategoryCounts() {
    const categoryCounts = {
      status: {},
      total: 0
    };

    return this.reduceItems((counts, item) => {
      if (item instanceof Service) {
        const itemStatus = item.getServiceStatus();
        if (itemStatus === null) {
          return counts;
        }
        counts.total++;
        if (counts.status[itemStatus.category]) {
          counts.status[itemStatus.category]++;
        } else {
          counts.status[itemStatus.category] = 1;
        }
      }

      return counts;
    }, categoryCounts);
  }

  getServiceTreeStatusSummary() {
    const status = this.getServiceStatus();
    const statusCategoryCounts = this.getStatusCategoryCounts();

    return {
      status: status.category,
      counts: statusCategoryCounts
    };
  }

  getName() {
    return this.getId()
      .split("/")
      .pop();
  }

  getRootGroupName() {
    return this.getId().split("/")[1];
  }

  getResources() {
    return this.reduceItems(
      (resources, item) => {
        if (item instanceof Service) {
          const { cpus = 0, mem = 0, disk = 0, gpus = 0 } = item.getResources();

          resources.cpus += cpus;
          resources.mem += mem;
          resources.disk += disk;
          resources.gpus += gpus;
        }

        return resources;
      },
      { cpus: 0, mem: 0, disk: 0, gpus: 0 }
    );
  }

  getStatus() {
    return this.getServiceStatus().displayName;
  }

  getServiceStatus() {
    return this.reduceItems((serviceTreeStatus, item) => {
      if (item instanceof Service) {
        const status = item.getServiceStatus();
        if (status == null) {
          return serviceTreeStatus;
        }

        if (status.priority > serviceTreeStatus.priority) {
          serviceTreeStatus = status;
        }
      }

      return serviceTreeStatus;
    }, ServiceStatus.NA);
  }

  getServices() {
    const items = this.reduceItems((services, item) => {
      if (item instanceof Service) {
        services.push(item);
      }

      return services;
    }, []);

    return new List({ items });
  }

  getGroups() {
    const items = this.reduceItems((groups, item) => {
      if (item instanceof ServiceTree) {
        groups.push(item);
      }

      return groups;
    }, []);

    return new List({ items });
  }

  getTasksSummary() {
    return this.reduceItems(
      (taskSummary, item) => {
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

  getRunningInstancesCount() {
    return this.flattenItems()
      .getItems()
      .reduce((memo, service) => {
        if (service instanceof ServiceTree) {
          return memo;
        }

        return memo + service.getRunningInstancesCount();
      }, 0);
  }

  getFrameworks() {
    return this.reduceItems((frameworks, item) => {
      if (item instanceof Framework) {
        frameworks.push(item);
      }

      return frameworks;
    }, []);
  }

  getVolumes() {
    const items = this.reduceItems((serviceTreeVolumes, item) => {
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
    return this.list.reduce((acc, el) => {
      Object.entries(el.labels || {}).forEach(([key, value]) => {
        acc.push({ key, value });
      });
      return acc;
    }, []);
  }

  getQuotaRoleStats(roleName = null, getMesosTasksByService) {
    const name = roleName || this.getName();
    return this.reduceItems(
      (roles, item) => {
        if (item instanceof ServiceTree) {
          return roles;
        }

        roles.count++;
        const itemRole = item.getRole();
        if (itemRole) {
          roles.rolesCount++;
          if (itemRole === name) {
            roles.groupRoleCount++;
          }
        }

        if (item instanceof Framework) {
          const tasks = getMesosTasksByService(item);
          if (tasks) {
            tasks.forEach(t => {
              roles.count++;

              const marathonTask = (item.get("tasks") || []).find(
                marathonTask => marathonTask.id === t.id
              );

              if (marathonTask) {
                const taskRole = marathonTask.role;

                if (taskRole) {
                  roles.rolesCount++;
                  if (taskRole === name) {
                    roles.groupRoleCount++;
                  }
                }
              }
            });
          }
        }

        return roles;
      },
      { count: 0, rolesCount: 0, groupRoleCount: 0 }
    );
  }

  isRoot() {
    return this.getId() === "/";
  }

  isTopLevel() {
    return !this.isRoot() && this.getId().split("/").length === 2;
  }
}
