import ServiceUtil from '../../utils/ServiceUtil';

export default class GroupStore {
  constructor({ endpoints }) {
    this.endpoints = endpoints;
    this.contentsById = new Map();
  }

  fetchGroups() {
    this.groupsPromise = this.endpoints.marathon.groups.get()
      .then((group) => this.parseGroups(group));

    return this.groupsPromise;
  }

  parseGroups(rootGroup) {
    const groups = [];
    // Top down depth-first
    const traverseTree = (group, parentId = null) => {
      // Take advantantage of Map which enumerates on insertion order.
      // By setting group first, all apps and sub groups will be inserted
      // after this group, meaning our API response will show this group first
      // followed by it's apps and finally sub-groups.
      this.contentsById.set(group.id, group);
      // Define its type to help us later when we resolve the union
      Object.defineProperty(group, '__graphQLType__', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: 'Group'
      });

      const {resources, taskStatus} = this.parseApplications(group);
      // simplify group by removing nested apps now they're parsed
      delete group.apps;

      group.parentId = parentId;
      group.resources = resources;
      group.taskStatus = taskStatus;

      groups.push(group);
      group.groups.forEach((subGroup) => {
        traverseTree(subGroup, group.id);
      });

      // simplify group by removing nested groups now they're parsed
      delete group.groups;
    };
    // Traverse from root
    traverseTree(rootGroup);

    // Bubble values to top with bottom-up breadth-first
    while (groups.length) {
      const childGroup = groups.pop();

      if (childGroup.parentId) {
        const parent = this.contentsById.get(childGroup.parentId);
        // Add to parents resources
        parent.resources = Object.keys(parent.resources)
          .reduce((memo, resource) => {
            memo[resource] += childGroup.resources[resource];

            return memo;
          }, parent.resources);

        // Add to parents taskStatus
        parent.taskStatus = Object.keys(parent.taskStatus)
          .reduce((memo, status) => {
            memo[status] += childGroup.taskStatus[status];

            return memo;
          }, parent.taskStatus);
      }
    }
  }

  parseApplications(group) {
    const resources = {
      cpus: 0,
      mem: 0,
      disk: 0
    };
    const taskStatus = {
      healthy: 0,
      running: 0,
      staged: 0,
      unhealthy: 0,
      unknown: 0,
      overCapacity: 0
    };

    group.apps.forEach((service) => {
      const {cpus = 0, mem = 0, disk = 0} = service;
      const serviceTaskStatus = ServiceUtil.getTasksSummary(service);

      Object.keys(taskStatus).forEach((statusType) => {
        taskStatus[statusType] += serviceTaskStatus[statusType];
      });
      // Define its type to help us later when we resolve the union
      Object.defineProperty(service, '__graphQLType__', {
        enumerable: false,
        configurable: true, // We may change to Framework later
        writable: false,
        value: 'Application'
      });

      service.parentId = group.id;
      service.taskStatus = serviceTaskStatus;
      service.resources = {
        cpus,
        disk,
        mem
      };

      this.contentsById.set(service.id, service);

      resources.cpus += cpus;
      resources.mem += mem;
      resources.disk += disk;
    });

    return {resources, taskStatus};
  }

  getGroupsPromise() {
    return this.groupsPromise || this.fetchGroups();
  }

  getById(id) {
    return this.getGroupsPromise().then(() => {
      const content = this.contentsById.get(id);

      if (content == null) {
        return null;
      }

      return content;
    });
  }

  getAll() {
    return this.getGroupsPromise().then(() => {
      return [...this.contentsById.values()];
    });
  }
}
