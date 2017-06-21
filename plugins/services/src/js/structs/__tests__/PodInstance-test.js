jest.dontMock("../../../../../../tests/_fixtures/pods/PodFixture");

const PodInstance = require("../PodInstance");
const PodInstanceStatus = require("../../constants/PodInstanceStatus");

const PodFixture = require("../../../../../../tests/_fixtures/pods/PodFixture");

describe("PodInstance", function() {
  describe("#constructor", function() {
    it("should correctly create instances", function() {
      const instanceSpec = PodFixture.instances[0];
      const instance = new PodInstance(Object.assign({}, instanceSpec));

      expect(instance.get()).toEqual(instanceSpec);
    });
  });

  describe("#getAgentAddress", function() {
    it("should return the correct value", function() {
      const podInstance = new PodInstance({ agentHostname: "agent-1234" });

      expect(podInstance.getAgentAddress()).toEqual("agent-1234");
    });

    it("should return the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getAgentAddress()).toEqual("");
    });
  });

  describe("#getId", function() {
    it("should return the correct value", function() {
      const podInstance = new PodInstance({ id: "instance-id-1234" });

      expect(podInstance.getId()).toEqual("instance-id-1234");
    });

    it("should return the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getId()).toEqual("");
    });
  });

  describe("#getName", function() {
    it("should return the correct value", function() {
      const podInstance = new PodInstance({ id: "instance-id-1234" });

      expect(podInstance.getName()).toEqual(podInstance.getId());
    });

    it("should return the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getName()).toEqual(podInstance.getId());
    });
  });

  describe("#getStatus", function() {
    it("should return FINISHED when all containers are FINISHED", function() {
      const podInstance = new PodInstance({
        status: "terminal",
        containers: [
          {
            status: "TASK_FINISHED"
          }
        ]
      });

      // when we are in TERMINAL state, but all containers are FINISHED, then
      // we should be considered FINISHED too.
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.FINISHED
      );
    });
  });

  describe("#getInstanceStatus", function() {
    it("should correctly detect container in PENDING state", function() {
      const podInstance = new PodInstance({
        status: "pending"
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.STAGED);
    });

    it("should correctly detect container in STAGING state", function() {
      const podInstance = new PodInstance({
        status: "staging"
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.STAGED);
    });

    it("should correctly detect container in DEGRADED state", function() {
      const podInstance = new PodInstance({
        status: "degraded"
      });

      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.UNHEALTHY
      );
    });

    it("should correctly detect container in TERMINAL state", function() {
      const podInstance = new PodInstance({
        status: "terminal"
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.KILLED);
    });

    it("should correctly detect container in STABLE state", function() {
      const podInstance = new PodInstance({
        status: "stable"
      });

      // No health checks, returns RUNNING
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.RUNNING
      );
    });

    it("should correctly detect container in UNHEALTHY state", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [{ name: "nginx", healthy: false }]
          }
        ]
      });

      // Single failing test, returns UNHEALTHY
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.UNHEALTHY
      );
    });

    it("should correctly detect container in HEALTHY state", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [{ name: "nginx", healthy: true }]
          }
        ]
      });

      // All tests passing, returns HEALTHY
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.HEALTHY
      );
    });
  });

  describe("#getLastChanged", function() {
    it("should return the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podInstance = new PodInstance({ lastChanged: dateString });

      expect(podInstance.getLastChanged()).toEqual(new Date(dateString));
    });

    it("should return the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getLastChanged().getTime()).toBeNaN();
    });
  });

  describe("#getLastUpdated", function() {
    it("should return the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podInstance = new PodInstance({ lastUpdated: dateString });

      expect(podInstance.getLastUpdated()).toEqual(new Date(dateString));
    });

    it("should return the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getLastUpdated().getTime()).toBeNaN();
    });
  });

  describe("#getResources", function() {
    it("should return the correct value", function() {
      const podInstance = new PodInstance({
        resources: { cpus: 0.5, mem: 64 }
      });

      expect(podInstance.getResources()).toEqual({
        cpus: 0.5,
        mem: 64,
        disk: 0,
        gpus: 0
      });
    });

    it("should return the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        disk: 0,
        gpus: 0
      });
    });
  });

  describe("#hasHealthChecks", function() {
    it("should return true if all container have health checks", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          },
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          }
        ]
      });

      expect(podInstance.hasHealthChecks()).toBeTruthy();
    });

    it("should return false if even one container has no checks", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [{ name: "nginx" }, { name: "marathon", healthy: true }]
          },
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          }
        ]
      });

      expect(podInstance.hasHealthChecks()).toBeFalsy();
    });

    it("should return true if instance state is not STABLE", function() {
      const podInstance = new PodInstance({
        status: "degraded",
        containers: [
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          },
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          }
        ]
      });

      // It returns true in order to display the `unhelathy` state
      expect(podInstance.hasHealthChecks()).toBeTruthy();
    });

    it("should return true if even one container is failing", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [{ name: "nginx" }, { name: "marathon", healthy: false }]
          },
          {
            endpoints: [{ name: "nginx" }, { name: "marathon" }]
          }
        ]
      });

      expect(podInstance.hasHealthChecks()).toBeTruthy();
    });

    it("should return false if there are no containers", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: []
      });

      expect(podInstance.hasHealthChecks()).toBeFalsy();
    });
  });

  describe("#isHealthy", function() {
    it("should return true if all container are healthy", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          },
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          }
        ]
      });

      expect(podInstance.isHealthy()).toBeTruthy();
    });

    it("should return true even if containers have no checks", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [{ name: "nginx" }, { name: "marathon", healthy: true }]
          },
          {
            endpoints: [{ name: "nginx" }, { name: "marathon" }]
          }
        ]
      });

      expect(podInstance.isHealthy()).toBeTruthy();
    });

    it("should return false if at least 1 container is unhealthy", function() {
      const podInstance = new PodInstance({
        status: "degraded",
        containers: [
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true }
            ]
          },
          {
            endpoints: [
              { name: "nginx", healthy: false },
              { name: "marathon", healthy: true }
            ]
          }
        ]
      });

      expect(podInstance.isHealthy()).toBeFalsy();
    });

    it("should return false on unhealthy container even on udnef", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            endpoints: [{ name: "nginx" }, { name: "marathon", healthy: false }]
          },
          {
            endpoints: [{ name: "nginx" }, { name: "marathon" }]
          }
        ]
      });

      expect(podInstance.isHealthy()).toBeFalsy();
    });

    it("should return true if there are no containers", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: []
      });

      expect(podInstance.isHealthy()).toBeTruthy();
    });
  });

  describe("#isRunning", function() {
    it("should return true when status is STABLE", function() {
      const podInstance = new PodInstance({ status: "stable" });
      expect(podInstance.isRunning()).toBeTruthy();
    });

    it("should return true when status is DEGRADED", function() {
      const podInstance = new PodInstance({ status: "degraded" });
      expect(podInstance.isRunning()).toBeTruthy();
    });

    it("should return false if not DEGRADED or STABLE", function() {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isRunning()).toBeFalsy();
    });
  });

  describe("#isStaging", function() {
    it("should return true when status is PENDING", function() {
      const podInstance = new PodInstance({ status: "pending" });
      expect(podInstance.isStaging()).toBeTruthy();
    });

    it("should return true when status is STAGING", function() {
      const podInstance = new PodInstance({ status: "staging" });
      expect(podInstance.isStaging()).toBeTruthy();
    });

    it("should return false if not STAGING or PENDING", function() {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isStaging()).toBeFalsy();
    });
  });

  describe("#isTerminating", function() {
    it("should return true when status is TERMINAL", function() {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isTerminating()).toBeTruthy();
    });

    it("should return false if not TERMINAL", function() {
      const podInstance = new PodInstance({ status: "running" });
      expect(podInstance.isTerminating()).toBeFalsy();
    });
  });
});
