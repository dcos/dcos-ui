import List from "#SRC/js/structs/List";
import MesosSummaryUtil from "#SRC/js/utils/MesosSummaryUtil";
import StringUtil from "#SRC/js/utils/StringUtil";

import Framework from "./Framework";

export default class ServicesList extends List<Framework> {
  static type = Framework;
  filter(filters) {
    let services = this.getItems();

    if (filters) {
      if (filters.ids) {
        services = services.filter((service) =>
          filters.ids.includes(service.id)
        );
      }

      if (filters.name) {
        services = StringUtil.filterByString(services, "name", filters.name);
      }

      if (filters.health != null && filters.health.length !== 0) {
        services = services.filter((service) =>
          filters.health.some(
            (healthValue) =>
              service.getHealth().value === parseInt(healthValue, 10)
          )
        );
      }
    }

    return new ServicesList({ items: services });
  }

  sumUsedResources() {
    const services = this.getItems();
    const resourcesList = services.map((service) => service.used_resources);

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
      TASK_ERROR: 0,
    };

    if (services.length === 0) {
      return tasks;
    }

    const taskTypes = Object.keys(tasks);

    services.forEach((service) => {
      taskTypes.forEach((taskType) => {
        if (service[taskType]) {
          tasks[taskType] += service[taskType];
        }
      });
    });

    return tasks;
  }
}
