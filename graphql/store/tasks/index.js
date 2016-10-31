export default class TaskStore {
  constructor({ endpoints }) {
    this.endpoints = endpoints;
    this.tasksById = new Map();
  }

  fetchTasks() {
    const statePromise = this.endpoints.mesos.state.get()
      .then((state) => this.parseState(state));

    const groupsPromise = this.endpoints.marathon.groups.get()
      .then((group) => this.parseGroups(group));

    this.tasksPromise = Promise.all([statePromise, groupsPromise]);

    return this.tasksPromise;
  }

  mergeTasks(taskList, key) {
    taskList.forEach((task) => {
      const taskId = task.id;
      // Place task data under key so we don't overwrite anything
      task = {[key]: task};

      if (this.tasksById.has(taskId)) {
        task = Object.assign({}, this.tasksById.get(taskId), task);
      }
      this.tasksById.set(taskId, task);
    });
  }

  parseGroups(group) {
    group.apps.forEach((app) => this.mergeTasks(app.tasks, 'marathon'));
    group.groups.forEach((subGroup) => this.parseGroups(subGroup));
  }

  parseState(state) {
    state.frameworks.forEach((framework) => {
      this.mergeTasks(framework.tasks, 'mesos');
      this.mergeTasks(framework.completed_tasks, 'mesos');
    });
  }

  getTasksPromise() {
    return this.tasksPromise || this.fetchTasks();
  }

  getById(id) {
    return this.getTasksPromise().then(() => {
      return this.tasksById.get(id);
    });
  }

  getAll() {
    return this.getTasksPromise().then(() => {
      return [...this.tasksById.values()];
    });
  }
}
