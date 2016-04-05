import List from './List';
import MesosSummaryUtil from '../utils/MesosSummaryUtil';
import Service from './Service';
import StringUtil from '../utils/StringUtil';

module.exports = class ServicesList extends List {
  constructor() {
    super(...arguments);

    // Replace list items instances of Service
    this.list = this.list.map(function (item) {
      if (item instanceof Service) {
        return item;
      } else {
        return new Service(item);
      }
    });
  }

  filter(filters) {
    let services = this.getItems();

    if (filters) {
      if (filters.ids) {
        services = services.filter(function (service) {
          return this.ids.indexOf(service.id) !== -1;
        }, {ids: filters.ids});
      }

      if (filters.name) {
        services = StringUtil.filterByString(services, 'name', filters.name);
      }

      if (filters.health != null) {
        services = services.filter(function (service) {
          return service.getHealth().value === filters.health;
        });
      }
    }

    return new ServicesList({items: services});
  }

  sumUsedResources() {
    let services = this.getItems();
    let resourcesList = services.map(function (service) {
      return service.used_resources || null;
    });
    return MesosSummaryUtil.sumResources(resourcesList);
  }

  sumTaskStates() {
    let services = this.getItems();

    let tasks = {
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

    let taskTypes = Object.keys(tasks);

    services.forEach(function (service) {
      taskTypes.forEach(function (taskType) {
        if (service[taskType]) {
          tasks[taskType] += service[taskType];
        }
      });
    });

    return tasks;
  }
};
