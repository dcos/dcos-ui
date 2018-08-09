const PodInstance = require("../PodInstance");
const PodInstanceStatus = require("../../constants/PodInstanceStatus");

const PodFixture = require("../../../../../../tests/_fixtures/pods/PodFixture");

describe("PodInstance", function() {
  describe("#constructor", function() {
    it("creates instances", function() {
      const instanceSpec = PodFixture.instances[0];
      const instance = new PodInstance(Object.assign({}, instanceSpec));

      expect(instance.get()).toEqual(instanceSpec);
    });
  });

  describe("#getAgentAddress", function() {
    it("returns the correct value", function() {
      const podInstance = new PodInstance({ agentHostname: "agent-1234" });

      expect(podInstance.getAgentAddress()).toEqual("agent-1234");
    });

    it("returns the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getAgentAddress()).toEqual("");
    });
  });

  describe("#getId", function() {
    it("returns the correct value", function() {
      const podInstance = new PodInstance({ id: "instance-id-1234" });

      expect(podInstance.getId()).toEqual("instance-id-1234");
    });

    it("returns the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getId()).toEqual("");
    });
  });

  describe("#getName", function() {
    it("returns the correct value", function() {
      const podInstance = new PodInstance({ id: "instance-id-1234" });

      expect(podInstance.getName()).toEqual(podInstance.getId());
    });

    it("returns the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getName()).toEqual(podInstance.getId());
    });
  });

  describe("#getAgentRegion", function() {
    it("returns the correct value", function() {
      const podInstance = new PodInstance({ agentRegion: "Region-a" });

      expect(podInstance.getAgentRegion()).toEqual("Region-a");
    });

    it("returns the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getAgentRegion()).toEqual("");
    });
  });

  describe("#getAgentZone", function() {
    it("returns the correct value", function() {
      const podInstance = new PodInstance({ agentZone: "Zone-a" });

      expect(podInstance.getAgentZone()).toEqual("Zone-a");
    });

    it("returns the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getAgentZone()).toEqual("");
    });
  });

  describe("#getStatus", function() {
    it("returns FINISHED when all containers are FINISHED", function() {
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
    it("detects container in PENDING state", function() {
      const podInstance = new PodInstance({
        status: "pending"
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.STAGED);
    });

    it("detects container in STAGING state", function() {
      const podInstance = new PodInstance({
        status: "staging"
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.STAGED);
    });

    it("detects container in DEGRADED state", function() {
      const podInstance = new PodInstance({
        status: "degraded"
      });

      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.UNHEALTHY
      );
    });

    it("detects container in TERMINAL state", function() {
      const podInstance = new PodInstance({
        status: "terminal"
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.KILLED);
    });

    it("detects container in STABLE state", function() {
      const podInstance = new PodInstance({
        status: "stable"
      });

      // No health checks, returns RUNNING
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.RUNNING
      );
    });

    it("detects container in UNHEALTHY state", function() {
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

    it("detects container in HEALTHY state", function() {
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
    it("returns the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podInstance = new PodInstance({ lastChanged: dateString });

      expect(podInstance.getLastChanged()).toEqual(new Date(dateString));
    });

    it("returns the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getLastChanged().getTime()).toBeNaN();
    });
  });

  describe("#getLastUpdated", function() {
    it("returns the correct value", function() {
      const dateString = "2016-08-31T01:01:01.001";
      const podInstance = new PodInstance({ lastUpdated: dateString });

      expect(podInstance.getLastUpdated()).toEqual(new Date(dateString));
    });

    it("returns the correct default value", function() {
      const podInstance = new PodInstance();
      expect(podInstance.getLastUpdated().getTime()).toBeNaN();
    });
  });

  describe("#getResources", function() {
    it("returns the correct value", function() {
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

    it("returns the correct default value", function() {
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
    it("returns true if all container have health checks", function() {
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

    it("returns true if at least one container has checks", function() {
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

      expect(podInstance.hasHealthChecks()).toEqual(true);
    });

    it("returns true if instance state is not STABLE", function() {
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

    it("returns true if even one container is failing", function() {
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

    it("returns false if there are no containers", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: []
      });

      expect(podInstance.hasHealthChecks()).toBeFalsy();
    });
  });

  describe("#isHealthy", function() {
    it("returns true if all container are healthy", function() {
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

    it("returns true even if containers have no checks", function() {
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

    it("returns false if at least 1 container is unhealthy", function() {
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

    it("returns false on unhealthy container even on udnef", function() {
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

    it("returns true if there are no containers", function() {
      const podInstance = new PodInstance({
        status: "stable",
        containers: []
      });

      expect(podInstance.isHealthy()).toBeTruthy();
    });
  });

  describe("#isRunning", function() {
    it("returns true when status is STABLE", function() {
      const podInstance = new PodInstance({ status: "stable" });
      expect(podInstance.isRunning()).toBeTruthy();
    });

    it("returns true when status is DEGRADED", function() {
      const podInstance = new PodInstance({ status: "degraded" });
      expect(podInstance.isRunning()).toBeTruthy();
    });

    it("returns false if not DEGRADED or STABLE", function() {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isRunning()).toBeFalsy();
    });
  });

  describe("#isStaging", function() {
    it("returns true when status is PENDING", function() {
      const podInstance = new PodInstance({ status: "pending" });
      expect(podInstance.isStaging()).toBeTruthy();
    });

    it("returns true when status is STAGING", function() {
      const podInstance = new PodInstance({ status: "staging" });
      expect(podInstance.isStaging()).toBeTruthy();
    });

    it("returns false if not STAGING or PENDING", function() {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isStaging()).toBeFalsy();
    });
  });

  describe("#isTerminating", function() {
    it("returns true when status is TERMINAL", function() {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isTerminating()).toBeTruthy();
    });

    it("returns false if not TERMINAL", function() {
      const podInstance = new PodInstance({ status: "running" });
      expect(podInstance.isTerminating()).toBeFalsy();
    });
  });

  describe("#getIpAddresses", function() {
    it("returns an array of IP Addresses", function() {
      const podInstance = new PodInstance({
        networks: [{ addresses: ["9.0.0.1"] }]
      });
      expect(podInstance.getIpAddresses()).toEqual(["9.0.0.1"]);
    });

    it("supports multiple networks", function() {
      const podInstance = new PodInstance({
        networks: [
          { addresses: ["9.0.0.1"] },
          { addresses: ["9.0.0.10", "9.0.0.11"] }
        ]
      });
      expect(podInstance.getIpAddresses()).toEqual([
        "9.0.0.1",
        "9.0.0.10",
        "9.0.0.11"
      ]);
    });

    it("returns an empty array", function() {
      const podInstance = new PodInstance({});
      expect(podInstance.getIpAddresses()).toEqual([]);
    });
  });
});
