const PodContainer = require("../PodContainer");
const PodContainerStatus = require("../../constants/PodContainerStatus");

const PodFixture = require("../../../../../../tests/_fixtures/pods/PodFixture");

describe("PodContainer", function() {
  describe("#constructor", function() {
    it("creates instances", function() {
      const containerSpec = PodFixture.instances[0].containers[0];
      const container = new PodContainer(Object.assign({}, containerSpec));

      expect(container.get()).toEqual(containerSpec);
    });
  });

  describe("#getContainerStatus", function() {
    it("detects container in ERROR state", function() {
      const podContainer = new PodContainer({
        status: "TASK_ERROR"
      });

      // It has no health checks, so it returns ERROR
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.ERROR
      );
    });

    it("detects container in FAILED state", function() {
      const podContainer = new PodContainer({
        status: "TASK_FAILED"
      });

      // It has no health checks, so it returns FAILED
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.FAILED
      );
    });

    it("detects container in FINISHED state", function() {
      const podContainer = new PodContainer({
        status: "TASK_FINISHED"
      });

      // It has no health checks, so it returns FINISHED
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.FINISHED
      );
    });

    it("detects container in KILLED state", function() {
      const podContainer = new PodContainer({
        status: "TASK_KILLED"
      });

      // It has no health checks, so it returns KILLED
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.KILLED
      );
    });

    it("detects container in RUNNING state", function() {
      const podContainer = new PodContainer({
        status: "TASK_RUNNING",
        conditions: []
      });

      // It has no health checks, so it returns RUNNING
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.RUNNING
      );
    });

    it("detects container in HEALTHY state", function() {
      const podContainer = new PodContainer({
        status: "TASK_RUNNING",
        conditions: [
          {
            lastChanged: "2019-01-01T12:00:00.000Z",
            lastUpdated: "2019-01-01T12:00:00.000Z",
            name: "healthy",
            reason: "health-reported-by-mesos",
            value: "true"
          }
        ]
      });

      // It has health-checks and it's healthy, so return HEALTHY
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.HEALTHY
      );
    });

    it("detects container in UNHEALTHY state", function() {
      const podContainer = new PodContainer({
        status: "TASK_RUNNING",
        conditions: [
          {
            lastChanged: "2019-01-01T12:00:00.000Z",
            lastUpdated: "2019-01-01T12:00:00.000Z",
            name: "healthy",
            reason: "health-reported-by-mesos",
            value: "false"
          }
        ]
      });

      // If even one health check fails, it should be unhealthy
      expect(podContainer.getContainerStatus()).toEqual(
        PodContainerStatus.UNHEALTHY
      );
    });

    it("handles unknown states", function() {
      const podContainer = new PodContainer({
        status: "totallyrandom"
      });

      // It has no health checks, so it returns KILLED
      expect(podContainer.getContainerStatus().displayName).toEqual("N/A");
    });

    it("handles unknown states", function() {
      const podContainer = new PodContainer({
        status: "TASK_TOTALLY_RANDOM"
      });

      // It has no health checks, so it returns KILLED
      expect(podContainer.getContainerStatus().displayName).toEqual("N/A");
    });
  });

  describe("#getEndpoints", function() {
    it("returns the correct value", function() {
      const endpoints = [{ name: "nginx", allocatedHostPort: 31001 }];
      const podContainer = new PodContainer({ endpoints });

      expect(podContainer.getEndpoints()).toEqual(endpoints);
    });

    it("returns the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getEndpoints()).toEqual([]);
    });
  });

  describe("#getId", function() {
    it("returns the correct value", function() {
      const podContainer = new PodContainer({ containerId: "container-1234" });

      expect(podContainer.getId()).toEqual("container-1234");
    });

    it("returns the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getId()).toEqual("");
    });
  });

  describe("#getLastChanged", function() {
    it("returns the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podContainer = new PodContainer({ lastChanged: dateString });

      expect(podContainer.getLastChanged()).toEqual(new Date(dateString));
    });

    it("returns the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getLastChanged().getTime()).toBeNaN();
    });
  });

  describe("#getLastUpdated", function() {
    it("returns the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podContainer = new PodContainer({ lastUpdated: dateString });

      expect(podContainer.getLastUpdated()).toEqual(new Date(dateString));
    });

    it("returns the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getLastUpdated().getTime()).toBeNaN();
    });
  });

  describe("#getName", function() {
    it("returns the correct value", function() {
      const podContainer = new PodContainer({ name: "container-1234" });

      expect(podContainer.getName()).toEqual("container-1234");
    });

    it("returns the correct default value", function() {
      const podContainer = new PodContainer();
      expect(podContainer.getName()).toEqual("");
    });
  });

  describe("#getResources", function() {
    it("returns the correct value", function() {
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

    it("returns the correct default value", function() {
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
    it("returns false if no health checks defined", function() {
      const podContainer = new PodContainer({
        conditions: []
      });

      expect(podContainer.hasHealthChecks()).toBeFalsy();
    });

    it("returns true if 'healthy' is defined for at least one container", function() {
      const podContainer = new PodContainer({
        conditions: [
          {
            lastChanged: "2019-01-01T12:00:00.000Z",
            lastUpdated: "2019-01-01T12:00:00.000Z",
            name: "healthy",
            reason: "health-reported-by-mesos",
            value: "true"
          }
        ]
      });

      expect(podContainer.hasHealthChecks()).toEqual(true);
    });
  });

  describe("#isHealthy", function() {
    it("returns true if no health checks defined", function() {
      const podContainer = new PodContainer({
        conditions: []
      });

      expect(podContainer.isHealthy()).toBeTruthy();
    });

    it("returns false if at least one check fails", function() {
      const podContainer = new PodContainer({
        conditions: [
          {
            lastChanged: "2019-01-01T12:00:00.000Z",
            lastUpdated: "2019-01-01T12:00:00.000Z",
            name: "healthy",
            reason: "health-reported-by-mesos",
            value: "false"
          }
        ]
      });

      expect(podContainer.isHealthy()).toBeFalsy();
    });

    it("returns true if all defined tests passes", function() {
      const podContainer = new PodContainer({
        conditions: [
          {
            lastChanged: "2019-01-01T12:00:00.000Z",
            lastUpdated: "2019-01-01T12:00:00.000Z",
            name: "healthy",
            reason: "health-reported-by-mesos",
            value: "true"
          }
        ]
      });

      expect(podContainer.isHealthy()).toBeTruthy();
    });
  });
});
