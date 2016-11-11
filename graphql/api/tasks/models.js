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

    return this.store.Tasks.getAll().then((tasks) => {
      return tasks.filter((task) => task.mesos.name === mesosTaskName);
    });
  }
}
