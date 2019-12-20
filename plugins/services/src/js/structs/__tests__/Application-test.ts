import * as ServiceStatus from "../../constants/ServiceStatus";

import Application from "../Application";
import HealthStatus from "../../constants/HealthStatus";
import TaskStats from "../TaskStats";
import VolumeList from "../VolumeList";

import ServiceImages from "../../constants/ServiceImages";

describe("Application", () => {
  describe("#getDeployments", () => {
    it("returns an empty array", () => {
      const service = new Application({
        deployments: []
      });

      expect(service.getDeployments()).toEqual([]);
    });

    it("returns an array with one deployment", () => {
      const service = new Application({
        deployments: [{ id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f7" }]
      });

      expect(service.getDeployments()).toEqual([
        { id: "4d08fc0d-d450-4a3e-9c85-464ffd7565f7" }
      ]);
    });
  });

  describe("#getHealth", () => {
    it("returns NA health status", () => {
      const service = new Application();

      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });

    it("returns correct health status for healthy services", () => {
      const service = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns correct health status for unhealthy services", () => {
      const service = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 1
      });

      expect(service.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns correct health status for idle services", () => {
      const service = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it("returns correct health status for NA services", () => {
      const service = new Application({
        healthChecks: [],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });

    it("returns correct health status for NA services with health checks", () => {
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

  describe("#getId", () => {
    it("returns correct id", () => {
      const service = new Application({
        id: "/test/cmd"
      });

      expect(service.getId()).toEqual("/test/cmd");
    });
  });

  describe("#getImages", () => {
    it("defaults to NA images", () => {
      const service = new Application({});

      expect(service.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });

    it("returns correct images from metadata", () => {
      const service = new Application({
        labels: {
          DCOS_PACKAGE_METADATA:
            "eyJpbWFnZXMiOiB7ICJpY29uLXNtYWxsIjogImZvby1zbWFsbC5wbmciLCAiaWNvbi1tZWRpdW0iOiAiZm9vLW1lZGl1bS5wbmciLCAiaWNvbi1sYXJnZSI6ICJmb28tbGFyZ2UucG5nIn19"
        }
      });

      expect(service.getImages()).toEqual({
        "icon-small": "foo-small.png",
        "icon-medium": "foo-medium.png",
        "icon-large": "foo-large.png"
      });
    });

    it("returns correct images from service", () => {
      const service = new Application({
        images: {
          "icon-small": "foo-small.png",
          "icon-medium": "foo-medium.png",
          "icon-large": "foo-large.png"
        }
      });

      expect(service.getImages()).toEqual({
        "icon-small": "foo-small.png",
        "icon-medium": "foo-medium.png",
        "icon-large": "foo-large.png"
      });
    });
  });

  describe("#getInstancesCount", () => {
    it("returns correct instances", () => {
      const service = new Application({
        instances: 1
      });

      expect(service.getInstancesCount()).toEqual(1);
    });

    it("returns 0 instances if instances is not present", () => {
      const service = new Application({});

      expect(service.getInstancesCount()).toEqual(0);
    });
  });

  describe("#getLabels", () => {
    it("returns correct labels", () => {
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

  describe("#getLastConfigChange", () => {
    it("returns correct date", () => {
      const service = new Application({
        versionInfo: {
          lastConfigChangeAt: "2016-03-22T10:46:07.354Z"
        }
      });

      expect(service.getLastConfigChange()).toEqual("2016-03-22T10:46:07.354Z");
    });
  });

  describe("#getLastScaled", () => {
    it("returns correct date", () => {
      const service = new Application({
        versionInfo: {
          lastScalingAt: "2016-03-22T10:46:07.354Z"
        }
      });

      expect(service.getLastScaled()).toEqual("2016-03-22T10:46:07.354Z");
    });
  });

  describe("#getName", () => {
    it("returns correct name", () => {
      const service = new Application({
        id: "/test/cmd"
      });

      expect(service.getName()).toEqual("cmd");
    });
  });

  describe("#getPorts", () => {
    it("returns correct port data", () => {
      const service = new Application({
        ports: [10001, 10002]
      });

      expect(service.getPorts()).toEqual([10001, 10002]);
    });
  });

  describe("#getResources", () => {
    it("returns correct resource data", () => {
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

    it("multiplies resources by the number of instances", () => {
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

  describe("#getStatus", () => {
    it("returns correct status for running app", () => {
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

    it("returns correct status for stopped app", () => {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      });

      expect(service.getStatus()).toEqual(ServiceStatus.STOPPED.displayName);
    });

    it("returns correct status for deploying app", () => {
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

    it("returns correct status for deploying app", () => {
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

  describe("#getServiceStatus", () => {
    it("returns correct status object for running app", () => {
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

    it("returns correct status for stopped app", () => {
      const service = new Application({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      });

      expect(service.getServiceStatus()).toEqual(ServiceStatus.STOPPED);
    });

    it("returns correct status for deploying app", () => {
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

    it("returns n/a status object when no other status is found", () => {
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

    it("tolerates a missing deployments field", () => {
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

  describe("#getLastTaskFailure", () => {
    it("returns correct task summary", () => {
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

  describe("#getTasksSummary", () => {
    it("returns correct task summary", () => {
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

    it("returns correct task summary for overcapcity", () => {
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

  describe("#getTaskStats", () => {
    it("returns task stats instance", () => {
      const service = new Application({ taskStats: {} });

      expect(service.getTaskStats() instanceof TaskStats).toBeTruthy();
    });
  });

  describe("#getVersion", () => {
    it("returns correct version", () => {
      const service = new Application({
        version: "2016-03-22T10:46:07.354Z"
      });

      expect(service.getVersion()).toEqual("2016-03-22T10:46:07.354Z");
    });
  });

  describe("#getVersions", () => {
    it("returns correct versions map", () => {
      const versionID = "2016-03-22T10:46:07.354Z";
      const service = new Application({
        versions: new Map([[versionID]])
      });

      expect(service.getVersions()).toEqual(new Map([[versionID]]));
    });
  });

  describe("#getVersionInfo", () => {
    it("returns correct version info", () => {
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

  describe("#getVolumes", () => {
    it("returns volume list", () => {
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

    it("returns empty volume list if volumes data is undefined", () => {
      const service = new Application({});

      expect(service.getVolumes().getItems().length).toEqual(0);
    });
  });

  describe("getWebURL", () => {
    // this test mostly makes sure that util isnt removed from `Service` struct - see ServiceUtil tests for more details
    it("returns url if service is SDK Service providing DCOS_SERVICE_WEB_PATH label", () => {
      const service = new Application({
        labels: {
          DCOS_SERVICE_NAME: "foo",
          DCOS_SERVICE_PORT_INDEX: "80",
          DCOS_SERVICE_SCHEME: "https",
          DCOS_COMMONS_API_VERSION: "notnull",
          DCOS_SERVICE_WEB_PATH: "/bar"
        }
      });
      expect(service.getWebURL()).toEqual("/service/foo/bar");
    });
  });

  describe("#toJSON", () => {
    it("returns a object with the values in _itemData", () => {
      const item = new Application({ foo: "bar", baz: "qux" });
      expect(item.toJSON()).toEqual({ foo: "bar", baz: "qux" });
    });

    it("returns a JSON string with the values in _itemData", () => {
      const item = new Application({ foo: "bar", baz: "qux" });
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });
  });

  describe("#getSpec", () => {
    it("cleans up JSON when getting the spec", () => {
      const item = new Application({ foo: "bar", baz: "qux", uris: [] });
      const spec = item.getSpec();
      expect(JSON.stringify(spec)).toEqual('{"foo":"bar","baz":"qux"}');
    });
  });

  describe("#findTaskById", () => {
    it("returns the task", () => {
      const service = new Application({
        tasks: [{ id: "foo" }]
      });
      expect(service.findTaskById("foo")).toEqual({ id: "foo" });
    });

    it("returns undefined", () => {
      const service = new Application({
        tasks: [{ id: "foo" }]
      });
      expect(service.findTaskById("unknown")).toEqual(undefined);
    });
  });

  describe("#isDelayed", () => {
    it("return false when not delayed", () => {
      const service = new Application({
        queue: {
          delay: {
            overdue: true
          }
        }
      });
      expect(service.isDelayed()).toEqual(false);
    });

    it("return false when property is missing", () => {
      const service = new Application({
        queue: {
          delay: {}
        }
      });
      expect(service.isDelayed()).toEqual(false);
    });

    it("return true when delayed", () => {
      const service = new Application({
        queue: {
          delay: {
            overdue: false
          }
        }
      });
      expect(service.isDelayed()).toEqual(true);
    });
  });
});
