import List from "../../../../../src/js/structs/List";
import MesosSummaryUtil from "../../../../../src/js/utils/MesosSummaryUtil";
import Framework from "./Framework";
import StringUtil from "../../../../../src/js/utils/StringUtil";

class ServicesList extends List {
  filter(filters) {
    let services = this.getItems();

    if (filters) {
      if (filters.ids) {
        services = services.filter(function(service) {
          return filters.ids.includes(service.id);
        });
      }

      if (filters.name) {
        services = StringUtil.filterByString(services, "name", filters.name);
      }

      if (filters.health != null && filters.health.length !== 0) {
        services = services.filter(function(service) {
          return filters.health.some(function(healthValue) {
            return service.getHealth().value === parseInt(healthValue, 10);
          });
        });
      }
    }

    return new ServicesList({ items: services });
  }

  sumUsedResources() {
    const services = this.getItems();
    const resourcesList = services.map(function(service) {
      return service.used_resources;
    });

    return MesosSummaryUtil.sumResources(resourcesList);
  }

  sumTaskStates() {
    const services = this.getItems();

    const tasks = {
      TASK_STAGING: 0,
      TASK_STARTING: 0,
      TASK_RUNNING: 0,
      TASK_FINISHED: 0,
      TASK_FAILED: 0,
      TASK_LOST: 0,
      TASK_ERROR: 0
    };

    if (services.length === 0) {
      return tasks;
    }

    const taskTypes = Object.keys(tasks);

    services.forEach(function(service) {
      taskTypes.forEach(function(taskType) {
        if (service[taskType]) {
          tasks[taskType] += service[taskType];
        }
      });
    });

    return tasks;
  }
}

ServicesList.type = Framework;

module.exports = ServicesList;
