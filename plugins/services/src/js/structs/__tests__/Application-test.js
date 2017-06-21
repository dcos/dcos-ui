const Application = require("../Application");
const HealthStatus = require("../../constants/HealthStatus");
const ServiceImages = require("../../constants/ServiceImages");
const ServiceStatus = require("../../constants/ServiceStatus");
const TaskStats = require("../TaskStats");
const VolumeList = require("../VolumeList");

describe("Application", function() {
  describe("#getDeployments", function() {
    it("should return an empty array", function() {
      const service = new Application({
        deployments: []
      });

      expect(service.getDeployments()).toEqual([]);
    });

    it("should return an array with one deployment", function() {
      const service = new Application({
        deployments: [{ id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f7" }]
      });

      expect(service.getDeployments()).toEqual([
        { id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f7" }
      ]);
    });
  });

  describe("#getHealth", function() {
    it("returns NA health status", function() {
      const service = new Application();

      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });

    it("returns correct health status for healthy services", function() {
      const service = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health status for unhealthy services", function() {
      const service = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 1
      });

      expect(service.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health status for idle services", function() {
      const service = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it("returns correct health status for NA services", function() {
      const service = new Application({
        healthChecks: [],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });

    it("returns correct health status for NA services with health checks", function() {
      const service = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });
  });

  describe("#getId", function() {
    it("returns correct id", function() {
      const service = new Application({
        id: "/test/cmd"
      });

      expect(service.getId()).toEqual("/test/cmd");
    });
  });

  describe("#getImages", function() {
    it("defaults to NA images", function() {
      const service = new Application({});

      expect(service.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns correct images", function() {
      const service = new Application({
        labels: {
          DCOS_PACKAGE_METADATA: "eyJpbWFnZXMiOiB7ICJpY29uLXNtYWxsIjogImZvby1zbWFsbC5wbmciLCAiaWNvbi1tZWRpdW0iOiAiZm9vLW1lZGl1bS5wbmciLCAiaWNvbi1sYXJnZSI6ICJmb28tbGFyZ2UucG5nIn19"
        }
      });

      expect(service.getImages()).toEqual({
        "icon-small": "foo-small.png",
        "icon-medium": "foo-medium.png",
        "icon-large": "foo-large.png"
      });
    });
  });

  describe("#getInstancesCount", function() {
    it("returns correct instances", function() {
      const service = new Application({
        instances: 1
      });

      expect(service.getInstancesCount()).toEqual(1);
    });

    it("returns 0 instances if instances is not present", function() {
      const service = new Application({});

      expect(service.getInstancesCount()).toEqual(0);
    });
  });

  describe("#getLabels", function() {
    it("returns correct labels", function() {
      const service = new Application({
        labels: {
          label_1: "1",
          label_2: "2"
        }
      });

      expect(service.getLabels()).toEqual({
        label_1: "1",
        label_2: "2"
      });
    });
  });

  describe("#getLastConfigChange", function() {
    it("returns correct date", function() {
      const service = new Application({
        versionInfo: {
          lastConfigChangeAt: "2016-03-22T10:46:07.354Z"
        }
      });

      expect(service.getLastConfigChange()).toEqual("2016-03-22T10:46:07.354Z");
    });
  });

  describe("#getLastScaled", function() {
    it("returns correct date", function() {
      const service = new Application({
        versionInfo: {
          lastScalingAt: "2016-03-22T10:46:07.354Z"
        }
      });

      expect(service.getLastScaled()).toEqual("2016-03-22T10:46:07.354Z");
    });
  });

  describe("#getName", function() {
    it("returns correct name", function() {
      const service = new Application({
        id: "/test/cmd"
      });

      expect(service.getName()).toEqual("cmd");
    });
  });

  describe("#getPorts", function() {
    it("returns correct port data", function() {
      const service = new Application({
        ports: [10001, 10002]
      });

      expect(service.getPorts()).toEqual([10001, 10002]);
    });
  });

  describe("#getResources", function() {
    it("should return correct resource data", function() {
      const service = new Application({
        cpus: 1,
        mem: 2,
        gpus: 3,
        disk: 4,
        instances: 1
      });

      expect(service.getResources()).toEqual({
        cpus: 1,
        mem: 2,
        gpus: 3,
        disk: 4
      });
    });

    it("should multiply resource by the number instances", function() {
      const service = new Application({
        cpus: 1,
        mem: 2,
        gpus: 3,
        disk: 4,
        instances: 2
      });

      expect(service.getResources()).toEqual({
        cpus: 2,
        mem: 4,
        gpus: 6,
        disk: 8
      });
    });
  });

  describe("#getStatus", function() {
    it("returns correct status for running app", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getStatus()).toEqual(ServiceStatus.RUNNING.displayName);
    });

    it("returns correct status for suspended app", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      });

      expect(service.getStatus()).toEqual(ServiceStatus.SUSPENDED.displayName);
    });

    it("returns correct status for deploying app", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{ id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1" }]
      });

      expect(service.getStatus()).toEqual(ServiceStatus.DEPLOYING.displayName);
    });

    it("returns correct status for deploying app", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getStatus()).toEqual(ServiceStatus.NA.displayName);
    });
  });

  describe("#getServiceStatus", function() {
    it("returns correct status object for running app", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getServiceStatus()).toEqual(ServiceStatus.RUNNING);
    });

    it("returns correct status for suspended app", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      });

      expect(service.getServiceStatus()).toEqual(ServiceStatus.SUSPENDED);
    });

    it("returns correct status for deploying app", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{ id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f1" }]
      });

      expect(service.getServiceStatus()).toEqual(ServiceStatus.DEPLOYING);
    });

    it("returns n/a status object when no other status is found", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getServiceStatus()).toEqual(ServiceStatus.NA);
    });

    it("tolerates a missing deployments field", function() {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1
      });
      expect(service.getServiceStatus.bind(service)).not.toThrow();
    });
  });

  describe("#getLastTaskFailure", function() {
    it("returns correct task summary", function() {
      const service = new Application({
        lastTaskFailure: {
          appId: "/toggle",
          host: "10.141.141.10",
          message: "Abnormal executor termination",
          state: "TASK_FAILED",
          taskId: "toggle.cc427e60-5046-11e4-9e34-56847afe9799",
          timestamp: "2014-09-12T23:23:41.711Z",
          version: "2014-09-12T23:28:21.737Z"
        }
      });

      expect(service.getLastTaskFailure()).toEqual({
        appId: "/toggle",
        host: "10.141.141.10",
        message: "Abnormal executor termination",
        state: "TASK_FAILED",
        taskId: "toggle.cc427e60-5046-11e4-9e34-56847afe9799",
        timestamp: "2014-09-12T23:23:41.711Z",
        version: "2014-09-12T23:28:21.737Z"
      });
    });
  });

  describe("#getTasksSummary", function() {
    it("returns correct task summary", function() {
      const service = new Application({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        tasksUnknown: 0,
        tasksOverCapacity: 0
      });
    });

    it("returns correct task summary for overcapcity", function() {
      const service = new Application({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 4,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 4,
        tasksHealthy: 2,
        tasksUnhealthy: 0,
        tasksUnknown: 2,
        tasksOverCapacity: 2
      });
    });
  });

  describe("#getTaskStats", function() {
    it("returns task stats instance", function() {
      const service = new Application({ taskStats: {} });

      expect(service.getTaskStats() instanceof TaskStats).toBeTruthy();
    });
  });

  describe("#getVersion", function() {
    it("returns correct version", function() {
      const service = new Application({
        version: "2016-03-22T10:46:07.354Z"
      });

      expect(service.getVersion()).toEqual("2016-03-22T10:46:07.354Z");
    });
  });

  describe("#getVersions", function() {
    it("returns correct versions map", function() {
      const versionID = "2016-03-22T10:46:07.354Z";
      const service = new Application({
        versions: new Map([[versionID]])
      });

      expect(service.getVersions()).toEqual(new Map([[versionID]]));
    });
  });

  describe("#getVersionInfo", function() {
    it("returns correct version info", function() {
      const service = new Application({
        version: "2016-03-22T10:46:07.354Z",
        versionInfo: {
          lastConfigChangeAt: "2016-03-22T10:46:07.354Z",
          lastScalingAt: "2016-03-22T10:46:07.354Z"
        }
      });

      expect(service.getVersionInfo()).toEqual({
        currentVersionID: "2016-03-22T10:46:07.354Z",
        lastConfigChangeAt: "2016-03-22T10:46:07.354Z",
        lastScalingAt: "2016-03-22T10:46:07.354Z"
      });
    });
  });

  describe("#getVolumes", function() {
    it("returns volume list", function() {
      const service = new Application({
        volumes: [
          {
            containerPath: "path",
            host: "0.0.0.1",
            id: "volume-id",
            mode: "RW",
            size: 2048,
            status: "Attached",
            type: "Persistent"
          }
        ]
      });

      expect(service.getVolumes() instanceof VolumeList).toBeTruthy();
    });

    it("returns empty volume list if volumes data is undefined", function() {
      const service = new Application({});

      expect(service.getVolumes().getItems().length).toEqual(0);
    });
  });

  describe("#getWebURL", function() {
    it("returns the url if the service label is present", function() {
      const service = new Application({
        labels: {
          DCOS_SERVICE_NAME: "baz",
          DCOS_SERVICE_PORT_INDEX: "80",
          DCOS_SERVICE_SCHEME: "https"
        }
      });
      expect(service.getWebURL()).toEqual("/service/baz/");
    });

    it("returns null if no labels are present", function() {
      const service = new Application({ foo: "bar" });
      expect(service.getWebURL()).toEqual(null);
    });

    it("returns null if not all labels are present", function() {
      const service1 = new Application({
        foo: "bar",
        labels: {
          DCOS_SERVICE_NAME: "baz",
          DCOS_SERVICE_PORT_INDEX: "80"
          // DCOS_SERVICE_SCHEME: 'https'
        }
      });
      const service2 = new Application({
        foo: "bar",
        labels: {
          DCOS_SERVICE_NAME: "baz",
          // DCOS_SERVICE_PORT_INDEX: '80',
          DCOS_SERVICE_SCHEME: "https"
        }
      });
      const service3 = new Application({
        foo: "bar",
        labels: {
          DCOS_SERVICE_NAME: "baz"
          // DCOS_SERVICE_PORT_INDEX: '80',
          // DCOS_SERVICE_SCHEME: 'https'
        }
      });
      expect(service1.getWebURL()).toEqual(null);
      expect(service2.getWebURL()).toEqual(null);
      expect(service3.getWebURL()).toEqual(null);
    });

    it("returns null if the name is an empty string", function() {
      const service = new Application({
        labels: {
          DCOS_SERVICE_NAME: "",
          DCOS_SERVICE_PORT_INDEX: "80",
          DCOS_SERVICE_SCHEME: "https"
        }
      });
      expect(service.getWebURL()).toEqual(null);
    });
  });

  describe("#toJSON", function() {
    it("returns a object with the values in _itemData", function() {
      const item = new Application({ foo: "bar", baz: "qux" });
      expect(item.toJSON()).toEqual({ foo: "bar", baz: "qux" });
    });

    it("returns a JSON string with the values in _itemData", function() {
      const item = new Application({ foo: "bar", baz: "qux" });
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });
  });

  describe("#getSpec", function() {
    it("should clean-up JSON when getting the spec", function() {
      const item = new Application({ foo: "bar", baz: "qux", uris: [] });
      const spec = item.getSpec();
      expect(JSON.stringify(spec)).toEqual('{"foo":"bar","baz":"qux"}');
    });
  });
});
