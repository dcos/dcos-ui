export default class Tasks {
  constructor({ store }) {
    this.store = store;
  }

  getById(id) {
    return this.store.Tasks.getById(id);
  }

  getByAgentId(agentId) {
    return this.store.Tasks.getAll().then((tasks) => {
      return tasks.filter((task) => task.mesos.slave_id === agentId);
    });
  }

  getByServiceId(serviceId) {
    const mesosTaskName = serviceId.split('/').slice(1).reverse().join('.');
    const getApplication = this.store.Groups.getById(serviceId);
    const getFrameworks = this.store.Frameworks.getAllByName();
    const getTasks = this.store.Tasks.getAll();

    return Promise.all([
      getApplication,
      getFrameworks,
      getTasks
    ]).then(([application, frameworks, tasks]) => {
      const frameworkName = application.labels &&
        application.labels.DCOS_PACKAGE_FRAMEWORK_NAME;

      let filteredTasks = [];
      let filteredTaskIds = new Map();

      if (frameworkName && frameworks.has(frameworkName)) {
        const framework = frameworks.get(frameworkName);
        // Get tasks started by mesos
        filteredTasks = tasks.filter((task) => {
          const match = task.mesos.framework_id === framework.id;
          if (match) {
            filteredTaskIds.set(task.mesos.id, true);
          }
          return match;
        });
      }

      return filteredTasks.concat(
        tasks.filter((task) => {
          return task.mesos.name === mesosTaskName
            && !filteredTaskIds.has(task.mesos.id);
        })
      );
    });
  }
};
