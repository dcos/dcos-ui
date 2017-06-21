jest.dontMock("../../../../../../tests/_fixtures/pods/PodFixture");

const PodContainer = require("../PodContainer");
const PodContainerStatus = require("../../constants/PodContainerStatus");

const PodFixture = require("../../../../../../tests/_fixtures/pods/PodFixture");

describe("PodContainer", function() {
  describe("#constructor", function() {
    it("should correctly create instances", function() {
      const containerSpec = PodFixture.instances[0].containers[0];
      const container = new PodContainer(Object.assign({}, containerSpec));

      expect(container.get()).toEqual(containerSpec);
    });
  });

  describe("#getContainerStatus", function() {
    it("should correctly detect container in ERROR state", function() {
      const podContainer = new PodContainer({
        status: "TASK_ERROR"
      });

      // It has no health checks, so it returns ERROR
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.ERROR
      );
    });

    it("should correctly detect container in FAILED state", function() {
      const podContainer = new PodContainer({
        status: "TASK_FAILED"
      });

      // It has no health checks, so it returns FAILED
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.FAILED
      );
    });

    it("should correctly detect container in FINISHED state", function() {
      const podContainer = new PodContainer({
        status: "TASK_FINISHED"
      });

      // It has no health checks, so it returns FINISHED
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.FINISHED
      );
    });

    it("should correctly detect container in KILLED state", function() {
      const podContainer = new PodContainer({
        status: "TASK_KILLED"
      });

      // It has no health checks, so it returns KILLED
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.KILLED
      );
    });

    it("should correctly detect container in RUNNING state", function() {
      const podContainer = new PodContainer({
        status: "TASK_RUNNING"
      });

      // It has no health checks, so it returns RUNNING
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.RUNNING
      );
    });

    it("should correctly detect container in HEALTHY state", function() {
      const podContainer = new PodContainer({
        status: "TASK_RUNNING",
        endpoints: [
          {
            name: "nginx",
            allocatedHostPort: 31001,
            healthy: true
          }
        ]
      });

      // It has health-checks and it's healthy, so return HEALTHY
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.HEALTHY
      );
    });

    it("should correctly detect container in UNHEALTHY state", function() {
      const podContainer = new PodContainer({
        status: "TASK_RUNNING",
        endpoints: [
          {
            name: "nginx",
            allocatedHostPort: 31001,
            healthy: false
          },
          {
            name: "netcat",
            allocatedHostPort: 31002,
            healthy: true
          }
        ]
      });

      // If even one health check fails, it should be unhealthy
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.UNHEALTHY
      );
    });

    it("should properly handle  unknown states", function() {
      const podContainer = new PodContainer({
        status: "totallyrandom"
      });

      // It has no health checks, so it returns KILLED
      expect(podContainer.getContainerStatus().displayName).toEqual("N/A");
    });

    it("should properly handle unknown states", function() {
      const podContainer = new PodContainer({
        status: "TASK_TOTALLY_RANDOM"
      });

      // It has no health checks, so it returns KILLED
      expect(podContainer.getContainerStatus().displayName).toEqual("N/A");
    });
  });

  describe("#getEndpoints", function() {
    it("should return the correct value", function() {
      const endpoints = [{ name: "nginx", allocatedHostPort: 31001 }];
      const podContainer = new PodContainer({ endpoints });

      expect(podContainer.getEndpoints()).toEqual(endpoints);
    });

    it("should return the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getEndpoints()).toEqual([]);
    });
  });

  describe("#getId", function() {
    it("should return the correct value", function() {
      const podContainer = new PodContainer({ containerId: "container-1234" });

      expect(podContainer.getId()).toEqual("container-1234");
    });

    it("should return the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getId()).toEqual("");
    });
  });

  describe("#getLastChanged", function() {
    it("should return the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podContainer = new PodContainer({ lastChanged: dateString });

      expect(podContainer.getLastChanged()).toEqual(new Date(dateString));
    });

    it("should return the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getLastChanged().getTime()).toBeNaN();
    });
  });

  describe("#getLastUpdated", function() {
    it("should return the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podContainer = new PodContainer({ lastUpdated: dateString });

      expect(podContainer.getLastUpdated()).toEqual(new Date(dateString));
    });

    it("should return the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getLastUpdated().getTime()).toBeNaN();
    });
  });

  describe("#getName", function() {
    it("should return the correct value", function() {
      const podContainer = new PodContainer({ name: "container-1234" });

      expect(podContainer.getName()).toEqual("container-1234");
    });

    it("should return the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getName()).toEqual("");
    });
  });

  describe("#getResources", function() {
    it("should return the correct value", function() {
      const podContainer = new PodContainer({
        resources: { cpus: 0.5, mem: 64 }
      });

      expect(podContainer.getResources()).toEqual({
        cpus: 0.5,
        mem: 64,
        disk: 0,
        gpus: 0
      });
    });

    it("should return the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        disk: 0,
        gpus: 0
      });
    });
  });

  describe("#hasHealthChecks", function() {
    it("should return false if no health checks defined", function() {
      const podContainer = new PodContainer({
        endpoints: [
          { name: "nginx", allocatedHostPort: 31001 },
          { name: "netcat", allocatedHostPort: 31002 }
        ]
      });

      expect(podContainer.hasHealthChecks()).toBeFalsy();
    });

    it("should return false if healthy is not defined everywhere", function() {
      const podContainer = new PodContainer({
        endpoints: [
          { name: "nginx", allocatedHostPort: 31001, healthy: true },
          { name: "netcat", allocatedHostPort: 31002 }
        ]
      });

      expect(podContainer.hasHealthChecks()).toBeFalsy();
    });

    it("should return true if at least one check has failed", function() {
      const podContainer = new PodContainer({
        endpoints: [
          { name: "nginx", allocatedHostPort: 31001, healthy: false },
          { name: "netcat", allocatedHostPort: 31002 }
        ]
      });

      expect(podContainer.hasHealthChecks()).toBeTruthy();
    });

    it("should return true if healthy is defined everywhere", function() {
      const podContainer = new PodContainer({
        endpoints: [
          { name: "nginx", allocatedHostPort: 31001, healthy: true },
          { name: "netcat", allocatedHostPort: 31002, healthy: true }
        ]
      });

      expect(podContainer.hasHealthChecks()).toBeTruthy();
    });
  });

  describe("#isHealthy", function() {
    it("should return true if no health checks defined", function() {
      const podContainer = new PodContainer({
        endpoints: [
          { name: "nginx", allocatedHostPort: 31001 },
          { name: "netcat", allocatedHostPort: 31002 }
        ]
      });

      expect(podContainer.isHealthy()).toBeTruthy();
    });

    it("should return false if at least one check fails", function() {
      const podContainer = new PodContainer({
        endpoints: [
          { name: "nginx", allocatedHostPort: 31001, healthy: false },
          { name: "netcat", allocatedHostPort: 31002 }
        ]
      });

      expect(podContainer.isHealthy()).toBeFalsy();
    });

    it("should return true if all defined tests passes", function() {
      const podContainer = new PodContainer({
        endpoints: [
          { name: "nginx", allocatedHostPort: 31001, healthy: true },
          { name: "netcat", allocatedHostPort: 31002 }
        ]
      });

      expect(podContainer.isHealthy()).toBeTruthy();
    });
  });
});
