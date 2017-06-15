jest.dontMock("../../../../../../tests/_fixtures/pods/PodFixture");

const Pod = require("../Pod");

const HealthStatus = require("../../constants/HealthStatus");
const PodFixture = require("../../../../../../tests/_fixtures/pods/PodFixture");
const ServiceImages = require("../../constants/ServiceImages");
const ServiceStatus = require("../../constants/ServiceStatus");

describe("Pod", function() {
  describe("#constructor", function() {
    it("should correctly create instances", function() {
      const instance = new Pod(Object.assign({}, PodFixture));
      expect(instance.get()).toEqual(PodFixture);
    });
  });

  describe("#countRunningInstances", function() {
    it("should return the correct value", function() {
      const pod = new Pod(PodFixture);
      expect(pod.countRunningInstances()).toEqual(2);
    });

    it("should return the correct default value", function() {
      const pod = new Pod();
      expect(pod.countRunningInstances()).toEqual(0);
    });
  });

  describe("#countNonTerminalInstances", function() {
    it("should return the correct value", function() {
      const pod = new Pod(PodFixture);
      expect(pod.countNonTerminalInstances()).toEqual(3);
    });

    it("should return the correct default value", function() {
      const pod = new Pod();
      expect(pod.countNonTerminalInstances()).toEqual(0);
    });
  });

  describe("#countTotalInstances", function() {
    it("should return the correct value", function() {
      const pod = new Pod(PodFixture);
      expect(pod.countTotalInstances()).toEqual(3);
    });

    it("should return the correct default value", function() {
      const pod = new Pod();
      expect(pod.countTotalInstances()).toEqual(0);
    });
  });

  describe("#getHealth", function() {
    it("should return the correct value when DEGRADED", function() {
      const pod = new Pod({ status: "degraded" });
      expect(pod.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("should return the correct value when STABLE", function() {
      const pod = new Pod({ status: "stable" });
      expect(pod.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("should return the correct default value", function() {
      const pod = new Pod();
      expect(pod.getHealth()).toEqual(HealthStatus.NA);
    });
  });

  describe("#getImages", function() {
    it("should return the correct value", function() {
      const pod = new Pod();
      expect(pod.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#getInstancesCount", function() {
    it("should pass-through from specs", function() {
      const pod = new Pod(PodFixture);
      expect(pod.getInstancesCount()).toEqual(
        pod.getSpec().getScalingInstances()
      );
    });
  });

  describe("#getLabels", function() {
    it("should pass-through from specs", function() {
      const pod = new Pod(PodFixture);
      expect(pod.getLabels()).toEqual(pod.getSpec().getLabels());
    });
  });

  describe("#getMesosId", function() {
    it("returns correct id", function() {
      const pod = new Pod({
        id: "/test/cmd"
      });

      expect(pod.getMesosId()).toEqual("test_cmd");
    });
  });

  describe("#getResources", function() {
    it("should return correct resource data", function() {
      const pod = new Pod({
        spec: {
          containers: [
            {
              resources: {
                cpus: 1,
                mem: 2,
                gpus: 3,
                disk: 4
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          }
        }
      });

      expect(pod.getResources()).toEqual({
        cpus: 1,
        mem: 2,
        gpus: 3,
        disk: 4
      });
    });

    it("should multiply resource by the number instances", function() {
      const pod = new Pod({
        spec: {
          containers: [
            {
              resources: {
                cpus: 1,
                mem: 2,
                gpus: 3,
                disk: 4
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 2
          }
        }
      });
      expect(pod.getResources()).toEqual({
        cpus: 2,
        mem: 4,
        gpus: 6,
        disk: 8
      });
    });
  });

  describe("#getServiceStatus", function() {
    it("should properly detect SUSPENDED", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 0
          }
        },
        instances: []
      });

      expect(pod.getServiceStatus()).toEqual(ServiceStatus.SUSPENDED);
    });

    it("should properly detect DEPLOYING", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 2
          }
        },
        instances: [{ status: "stable" }]
      });
      expect(pod.getServiceStatus()).toEqual(ServiceStatus.DEPLOYING);
    });

    it("should properly detect RUNNING", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 1
          }
        },
        instances: [{ status: "stable" }]
      });
      expect(pod.getServiceStatus()).toEqual(ServiceStatus.RUNNING);
    });

    it("should properly detect NA", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 1
          }
        },
        instances: [{ status: "pending" }]
      });
      expect(pod.getServiceStatus()).toEqual(ServiceStatus.NA);
    });
  });

  describe("#getTasksSummary", function() {
    it("should properly count healthy instances", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 1
          },
          containers: [{}]
        },
        instances: [
          {
            status: "stable",
            containers: [
              {
                status: "stable",
                endpoints: [{ name: "nginx", healthy: true }]
              }
            ]
          }
        ]
      });

      expect(pod.getTasksSummary()).toEqual({
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksUnknown: 0,
        tasksOverCapacity: 0
      });
    });

    it("should properly count unhealthy instances", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 1
          },
          containers: [{}]
        },
        instances: [
          {
            status: "stable",
            containers: [
              {
                status: "stable",
                endpoints: [{ name: "nginx", healthy: false }]
              }
            ]
          }
        ]
      });

      expect(pod.getTasksSummary()).toEqual({
        tasksHealthy: 0,
        tasksUnhealthy: 1,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksUnknown: 0,
        tasksOverCapacity: 0
      });
    });

    it("should properly count unknown instances", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 1
          },
          containers: [{}]
        },
        instances: [
          {
            status: "stable",
            containers: [
              {
                status: "stable",
                endpoints: [{ name: "nginx" }]
              }
            ]
          }
        ]
      });

      expect(pod.getTasksSummary()).toEqual({
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksUnknown: 1,
        tasksOverCapacity: 0
      });
    });

    it("should properly count staged instances", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 1
          },
          containers: [{}]
        },
        instances: [
          {
            status: "pending",
            containers: [
              {
                status: "pending",
                endpoints: [{ name: "nginx" }]
              }
            ]
          }
        ]
      });

      expect(pod.getTasksSummary()).toEqual({
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        tasksStaged: 1,
        tasksRunning: 0,
        tasksUnknown: 0,
        tasksOverCapacity: 0
      });
    });

    it("should properly count over-capacity instances", function() {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 1
          },
          containers: [{}]
        },
        instances: [
          {
            status: "stable",
            containers: [
              {
                status: "stable",
                endpoints: [{ name: "nginx" }]
              }
            ]
          },
          {
            status: "stable",
            containers: [
              {
                status: "stable",
                endpoints: [{ name: "nginx" }]
              }
            ]
          }
        ]
      });

      expect(pod.getTasksSummary()).toEqual({
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        tasksStaged: 0,
        tasksRunning: 2,
        tasksUnknown: 2,
        tasksOverCapacity: 1
      });
    });
  });
});
