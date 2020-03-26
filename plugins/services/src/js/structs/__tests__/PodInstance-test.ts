import PodInstance from "../PodInstance";
import PodInstanceStatus from "../../constants/PodInstanceStatus";

import PodFixture from "../../../../../../tests/_fixtures/pods/PodFixture";

const conditions = {
  unhealthyConditions: {
    lastChanged: "2019-01-01T12:00:00.000Z",
    lastUpdated: "2019-01-01T12:00:00.000Z",
    name: "healthy",
    reason: "health-reported-by-mesos",
    value: "false",
  },
  healthyConditions: {
    lastChanged: "2019-01-01T12:00:00.000Z",
    lastUpdated: "2019-01-01T12:00:00.000Z",
    name: "healthy",
    reason: "health-reported-by-mesos",
    value: "true",
  },
  somethingelseConditions: {
    lastChanged: "2019-01-01T12:00:00.000Z",
    lastUpdated: "2019-01-01T12:00:00.000Z",
    name: "something-else",
    reason: "health-reported-by-mesos",
    value: "true",
  },
};

describe("PodInstance", () => {
  describe("#constructor", () => {
    it("creates instances", () => {
      const instanceSpec = PodFixture.instances[0];
      const instance = new PodInstance({
        ...instanceSpec,
      });

      expect(instance.get()).toEqual(instanceSpec);
    });
  });

  describe("#getAgentAddress", () => {
    it("returns the given agent address", () => {
      const podInstance = new PodInstance({ agentHostname: "agent-1234" });

      expect(podInstance.getAgentAddress()).toEqual("agent-1234");
    });

    it("returns the correct default value", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getAgentAddress()).toEqual("");
    });
  });

  describe("#getId", () => {
    it("returns the given id", () => {
      const podInstance = new PodInstance({ id: "instance-id-1234" });

      expect(podInstance.getId()).toEqual("instance-id-1234");
    });

    it("returns the correct default value", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getId()).toEqual("");
    });
  });

  describe("#getName", () => {
    it("returns the given name", () => {
      const podInstance = new PodInstance({ id: "instance-id-1234" });

      expect(podInstance.getName()).toEqual(podInstance.getId());
    });

    it("returns the correct default value", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getName()).toEqual(podInstance.getId());
    });
  });

  describe("#getAgentRegion", () => {
    it("returns the given region", () => {
      const podInstance = new PodInstance({ agentRegion: "Region-a" });

      expect(podInstance.getAgentRegion()).toEqual("Region-a");
    });

    it("returns the correct default value", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getAgentRegion()).toEqual("");
    });
  });

  describe("#getAgentZone", () => {
    it("returns the given zone", () => {
      const podInstance = new PodInstance({ agentZone: "Zone-a" });

      expect(podInstance.getAgentZone()).toEqual("Zone-a");
    });

    it("returns an empty string as default zone", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getAgentZone()).toEqual("");
    });
  });

  describe("#getStatus", () => {
    it("returns FINISHED when all containers are FINISHED", () => {
      const podInstance = new PodInstance({
        status: "terminal",
        containers: [
          {
            status: "TASK_FINISHED",
          },
        ],
      });

      // when we are in TERMINAL state, but all containers are FINISHED, then
      // we should be considered FINISHED too.
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.FINISHED
      );
    });
  });

  describe("#getInstanceStatus", () => {
    it("detects container in PENDING state", () => {
      const podInstance = new PodInstance({
        status: "pending",
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.STAGED);
    });

    it("detects container in STAGING state", () => {
      const podInstance = new PodInstance({
        status: "staging",
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.STAGED);
    });

    it("detects container in DEGRADED state", () => {
      const podInstance = new PodInstance({
        status: "degraded",
      });

      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.UNHEALTHY
      );
    });

    it("detects container in TERMINAL state", () => {
      const podInstance = new PodInstance({
        status: "terminal",
      });

      expect(podInstance.getInstanceStatus()).toEqual(PodInstanceStatus.KILLED);
    });

    it("detects container in STABLE state", () => {
      const podInstance = new PodInstance({
        status: "stable",
      });

      // No health checks, returns RUNNING
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.RUNNING
      );
    });

    it("detects container in UNHEALTHY state", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.unhealthyConditions],
          },
        ],
      });

      // Single failing test, returns UNHEALTHY
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.UNHEALTHY
      );
    });

    it("detects container in HEALTHY state", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.healthyConditions],
          },
        ],
      });

      // All tests passing, returns HEALTHY
      expect(podInstance.getInstanceStatus()).toEqual(
        PodInstanceStatus.HEALTHY
      );
    });
  });

  describe("#getLastChanged", () => {
    it("returns the given date", () => {
      const dateString = "2016-08-31T01:01:01.001";
      const podInstance = new PodInstance({ lastChanged: dateString });

      expect(podInstance.getLastChanged()).toEqual(new Date(dateString));
    });

    it("returns the correct default value", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getLastChanged().getTime()).toBeNaN();
    });
  });

  describe("#getLastUpdated", () => {
    it("returns the given date", () => {
      const dateString = "2016-08-31T01:01:01.001";
      const podInstance = new PodInstance({ lastUpdated: dateString });

      expect(podInstance.getLastUpdated()).toEqual(new Date(dateString));
    });

    it("returns the correct default value", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getLastUpdated().getTime()).toBeNaN();
    });
  });

  describe("#getResources", () => {
    it("returns the correct resources", () => {
      const podInstance = new PodInstance({
        resources: { cpus: 0.5, mem: 64 },
      });

      expect(podInstance.getResources()).toEqual({
        cpus: 0.5,
        mem: 64,
        disk: 0,
        gpus: 0,
      });
    });

    it("returns the correct default value", () => {
      const podInstance = new PodInstance();
      expect(podInstance.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        disk: 0,
        gpus: 0,
      });
    });
  });

  describe("#hasHealthChecks", () => {
    it("returns true if all containers have health checks", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.healthyConditions],
          },
          {
            conditions: [conditions.unhealthyConditions],
          },
        ],
      });

      expect(podInstance.hasHealthChecks()).toBeTruthy();
    });

    it("returns true if at least one container has checks", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.healthyConditions],
          },
        ],
      });

      expect(podInstance.hasHealthChecks()).toEqual(true);
    });

    it("returns true if instance state is not STABLE", () => {
      const podInstance = new PodInstance({
        status: "degraded",
        containers: [
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true },
            ],
          },
          {
            endpoints: [
              { name: "nginx", healthy: true },
              { name: "marathon", healthy: true },
            ],
          },
        ],
      });

      // It returns true in order to display the `unhelathy` state
      expect(podInstance.hasHealthChecks()).toBeTruthy();
    });

    it("returns true if even one container is failing", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.healthyConditions],
          },
          {
            conditions: [conditions.unhealthyConditions],
          },
        ],
      });

      expect(podInstance.hasHealthChecks()).toBeTruthy();
    });

    it("returns false if there are no containers", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [],
      });

      expect(podInstance.hasHealthChecks()).toBeFalsy();
    });
  });

  describe("#isHealthy", () => {
    it("returns true if all containers are healthy", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.healthyConditions],
          },
          {
            conditions: [conditions.healthyConditions],
          },
        ],
      });

      expect(podInstance.isHealthy()).toBeTruthy();
    });

    it("returns true even if containers have no checks", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.somethingelseConditions],
          },
        ],
      });

      expect(podInstance.isHealthy()).toBeTruthy();
    });

    it("returns false if at least 1 container is unhealthy", () => {
      const podInstance = new PodInstance({
        status: "degraded",
        containers: [
          {
            conditions: [conditions.healthyConditions],
          },
          {
            conditions: [conditions.unhealthyConditions],
          },
        ],
      });

      expect(podInstance.isHealthy()).toBeFalsy();
    });

    it("returns false on unhealthy container even on udnef", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [
          {
            conditions: [conditions.unhealthyConditions],
          },
        ],
      });

      expect(podInstance.isHealthy()).toBeFalsy();
    });

    it("returns true if there are no containers", () => {
      const podInstance = new PodInstance({
        status: "stable",
        containers: [],
      });

      expect(podInstance.isHealthy()).toBeTruthy();
    });
  });

  describe("#isRunning", () => {
    it("returns true when status is STABLE", () => {
      const podInstance = new PodInstance({ status: "stable" });
      expect(podInstance.isRunning()).toBeTruthy();
    });

    it("returns true when status is DEGRADED", () => {
      const podInstance = new PodInstance({ status: "degraded" });
      expect(podInstance.isRunning()).toBeTruthy();
    });

    it("returns false if not DEGRADED or STABLE", () => {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isRunning()).toBeFalsy();
    });
  });

  describe("#isStaging", () => {
    it("returns true when status is PENDING", () => {
      const podInstance = new PodInstance({ status: "pending" });
      expect(podInstance.isStaging()).toBeTruthy();
    });

    it("returns true when status is STAGING", () => {
      const podInstance = new PodInstance({ status: "staging" });
      expect(podInstance.isStaging()).toBeTruthy();
    });

    it("returns false if not STAGING or PENDING", () => {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isStaging()).toBeFalsy();
    });
  });

  describe("#isTerminating", () => {
    it("returns true when status is TERMINAL", () => {
      const podInstance = new PodInstance({ status: "terminal" });
      expect(podInstance.isTerminating()).toBeTruthy();
    });

    it("returns false if not TERMINAL", () => {
      const podInstance = new PodInstance({ status: "running" });
      expect(podInstance.isTerminating()).toBeFalsy();
    });
  });

  describe("#getIpAddresses", () => {
    it("returns an array of IP Addresses", () => {
      const podInstance = new PodInstance({
        networks: [{ addresses: ["9.0.0.1"] }],
      });
      expect(podInstance.getIpAddresses()).toEqual(["9.0.0.1"]);
    });

    it("supports multiple networks", () => {
      const podInstance = new PodInstance({
        networks: [
          { addresses: ["9.0.0.1"] },
          { addresses: ["9.0.0.10", "9.0.0.11"] },
        ],
      });
      expect(podInstance.getIpAddresses()).toEqual([
        "9.0.0.1",
        "9.0.0.10",
        "9.0.0.11",
      ]);
    });

    it("returns an empty array", () => {
      const podInstance = new PodInstance({});
      expect(podInstance.getIpAddresses()).toEqual([]);
    });
  });
});
