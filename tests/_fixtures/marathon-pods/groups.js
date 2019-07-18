const createFrameworks = () =>
  [318, 200, 500, 204, 202, 203, 205, 206, 320, 321, 326, 503].map(
    statusCode => ({
      id: `/${statusCode}-hello-world`,
      backoffFactor: 1.15,
      backoffSeconds: 1,
      cmd:
        'export LD_LIBRARY_PATH=$MESOS_SANDBOX/libmesos-bundle/lib:$LD_LIBRARY_PATH; export MESOS_NATIVE_JAVA_LIBRARY=$(ls $MESOS_SANDBOX/libmesos-bundle/lib/libmesos-*.so); export JAVA_HOME=$(ls -d $MESOS_SANDBOX/jdk*/jre/); export JAVA_HOME=${JAVA_HOME%/}; export PATH=$(ls -d $JAVA_HOME/bin):$PATH && export JAVA_OPTS="-Xms256M -Xmx512M -XX:-HeapDumpOnOutOfMemoryError " && ./bootstrap -resolve=false -template=false && ./hello-world-scheduler/bin/helloworld svc ',
      cpus: 0.5,
      disk: 0,
      env: {},
      executor: "",
      fetch: [],
      check: {
        http: {
          portIndex: 0,
          path: "/v1/health",
          scheme: "HTTP"
        },
        intervalSeconds: 30,
        timeoutSeconds: 30,
        delaySeconds: 15
      },
      instances: 1,
      labels: {
        DCOS_COMMONS_UNINSTALL: "true",
        DCOS_PACKAGE_OPTIONS: "e30=",
        DCOS_SERVICE_SCHEME: "http",
        DCOS_PACKAGE_SOURCE: "",
        DCOS_SERVICE_NAME: "hello-world",
        DCOS_PACKAGE_FRAMEWORK_NAME: "hello-world",
        DCOS_SERVICE_PORT_INDEX: "0",
        DCOS_PACKAGE_DEFINITION: "",
        DCOS_PACKAGE_VERSION: "stub-universe",
        DCOS_COMMONS_API_VERSION: "v1",
        DCOS_PACKAGE_NAME: "hello-world",
        MARATHON_SINGLE_INSTANCE_APP: "true"
      },
      maxLaunchDelaySeconds: 300,
      mem: 1024,
      gpus: 0,
      networks: [
        {
          mode: "host"
        }
      ],
      portDefinitions: [
        {
          port: 10000,
          name: "api",
          protocol: "tcp"
        }
      ],
      requirePorts: false,
      upgradeStrategy: {
        maximumOverCapacity: 0,
        minimumHealthCapacity: 0
      },
      user: "nobody",
      version: "2019-03-25T12:02:05.516Z",
      versionInfo: {
        lastScalingAt: "2019-03-25T12:02:05.516Z",
        lastConfigChangeAt: "2019-03-25T12:02:05.516Z"
      },
      killSelection: "YOUNGEST_FIRST",
      unreachableStrategy: {
        inactiveAfterSeconds: 0,
        expungeAfterSeconds: 0
      },
      tasksStaged: 0,
      tasksRunning: 1,
      tasksHealthy: 0,
      tasksUnhealthy: 0,
      deployments: [],
      tasks: [
        {
          appId: "/hello-world",
          healthCheckResults: [],
          checkResult: {
            http: {
              statusCode
            }
          },
          host: "10.0.1.162",
          id:
            "hello-world.instance-cf3b8851-4ef5-11e9-83b0-1ad9242b62b6._app.1",
          ipAddresses: [
            {
              ipAddress: "10.0.1.162",
              protocol: "IPv4"
            }
          ],
          ports: [15457],
          servicePorts: [],
          slaveId: "28b00233-9022-4f32-a250-02bd9c669185-S1",
          state: "TASK_RUNNING",
          stagedAt: "2019-03-25T12:02:06.574Z",
          startedAt: "2019-03-25T12:02:18.558Z",
          version: "2019-03-25T12:02:05.516Z",
          localVolumes: [],
          region: "aws/eu-central-1",
          zone: "aws/eu-central-1a"
        }
      ],
      taskStats: {
        startedAfterLastScaling: {
          stats: {
            counts: {
              staged: 0,
              running: 1,
              healthy: 0,
              unhealthy: 0
            },
            lifeTime: {
              averageSeconds: 600.297,
              medianSeconds: 600.297
            }
          }
        },
        withLatestConfig: {
          stats: {
            counts: {
              staged: 0,
              running: 1,
              healthy: 0,
              unhealthy: 0
            },
            lifeTime: {
              averageSeconds: 600.297,
              medianSeconds: 600.297
            }
          }
        },
        totalSummary: {
          stats: {
            counts: {
              staged: 0,
              running: 1,
              healthy: 0,
              unhealthy: 0
            },
            lifeTime: {
              averageSeconds: 600.297,
              medianSeconds: 600.297
            }
          }
        }
      }
    })
  );
module.exports = {
  apps: [
    ...createFrameworks(),
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
      enforceRole: true,
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
    },
    {
      id: "/10_apps",
      enforceRole: true,
      apps: [...Array(10).keys()].map(i => ({
        id: `/10_apps/sleep_${i}`,
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
        deployments: [],
        role: "slave_public"
      })),
      dependencies: [],
      groups: [],
      pods: [],
      version: "2015-08-28T01:26:14.620Z"
    },
    {
      id: "/2_apps",
      enforceRole: true,
      apps: [
        {
          id: "/2_apps/sleep_0",
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
          deployments: [],
          role: "2_apps"
        },
        {
          id: "/2_apps/sleep_no_limit",
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
          version: "2019-01-01T01:26:14.620Z",
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          deployments: [],
          role: "slave_public"
        }
      ],
      dependencies: [],
      groups: [],
      pods: [],
      version: "2015-08-28T01:26:14.620Z"
    },
    {
      id: "/1_app",
      enforceRole: true,
      apps: [
        {
          id: "/1_app/sleep_1",
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
          deployments: [],
          role: "1_app"
        }
      ],
      dependencies: [],
      groups: [],
      pods: [],
      version: "2019-01-01T01:26:14.620Z"
    }
  ],
  pods: [],
  id: "/"
};
