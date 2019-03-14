module.exports = {
  apps: [
    {
      id: `/10000_tasks`,
      cmd: "sleep 3000",
      args: null,
      user: null,
      env: {},
      instances: 1,
      cpus: 0.1,
      mem: 16,
      disk: 0,
      executor: "",
      constraints: [],
      uris: [],
      storeUrls: [],
      ports: [10000],
      requirePorts: false,
      backoffSeconds: 1,
      backoffFactor: 1.15,
      maxLaunchDelaySeconds: 3600,
      container: null,
      healthChecks: [],
      dependencies: [],
      upgradeStrategy: {
        minimumHealthCapacity: 1,
        maximumOverCapacity: 1
      },
      labels: {},
      acceptedResourceRoles: null,
      version: "2015-08-28T01:26:14.620Z",
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 0,
      tasksUnhealthy: 0,
      deployments: []
    }
  ],
  dependencies: [],
  groups: [
    {
      id: "/10000_apps",
      apps: [...Array(10000).keys()].map(i => ({
        id: `/sleep_${i}`,
        cmd: "sleep 3000",
        args: null,
        user: null,
        env: {},
        instances: 1,
        cpus: 0.1,
        mem: 16,
        disk: 0,
        executor: "",
        constraints: [],
        uris: [],
        storeUrls: [],
        ports: [10000],
        requirePorts: false,
        backoffSeconds: 1,
        backoffFactor: 1.15,
        maxLaunchDelaySeconds: 3600,
        container: null,
        healthChecks: [],
        dependencies: [],
        upgradeStrategy: {
          minimumHealthCapacity: 1,
          maximumOverCapacity: 1
        },
        labels: {},
        acceptedResourceRoles: null,
        version: "2015-08-28T01:26:14.620Z",
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        deployments: []
      })),
      dependencies: [],
      groups: [],
      pods: [],
      version: "2015-08-28T01:26:14.620Z"
    }
  ],
  pods: [],
  id: "/"
};
