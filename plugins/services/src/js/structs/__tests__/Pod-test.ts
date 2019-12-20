import * as ServiceStatus from "../../constants/ServiceStatus";

import Pod from "../Pod";
import PodInstance from "../PodInstance";

import HealthStatus from "../../constants/HealthStatus";
import PodFixture from "../../../../../../tests/_fixtures/pods/PodFixture";

import ServiceImages from "../../constants/ServiceImages";

describe("Pod", () => {
  describe("#constructor", () => {
    it("creates instances", () => {
      const instance = new Pod({
        ...PodFixture
      });
      expect(instance.get()).toEqual(PodFixture);
    });
  });

  describe("#countRunningInstances", () => {
    it("returns the correct value", () => {
      const pod = new Pod(PodFixture);
      expect(pod.getRunningInstancesCount()).toEqual(2);
    });

    it("returns the correct default value", () => {
      const pod = new Pod();
      expect(pod.getRunningInstancesCount()).toEqual(0);
    });
  });

  describe("#countNonTerminalInstances", () => {
    it("returns the correct value", () => {
      const pod = new Pod(PodFixture);
      expect(pod.countNonTerminalInstances()).toEqual(3);
    });

    it("returns the correct default value", () => {
      const pod = new Pod();
      expect(pod.countNonTerminalInstances()).toEqual(0);
    });
  });

  describe("#countTotalInstances", () => {
    it("returns the correct value", () => {
      const pod = new Pod(PodFixture);
      expect(pod.countTotalInstances()).toEqual(3);
    });

    it("returns the correct default value", () => {
      const pod = new Pod();
      expect(pod.countTotalInstances()).toEqual(0);
    });
  });

  describe("#getHealth", () => {
    it("returns the correct value when DEGRADED", () => {
      const pod = new Pod({ status: "degraded" });
      expect(pod.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it("returns the correct value when STABLE", () => {
      const pod = new Pod({ status: "stable" });
      expect(pod.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it("returns the correct default value", () => {
      const pod = new Pod();
      expect(pod.getHealth()).toEqual(HealthStatus.NA);
    });
  });

  describe("#getImages", () => {
    it("returns the correct value", () => {
      const pod = new Pod();
      expect(pod.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#getRegions", () => {
    it("returns empty array for empty Pod object", () => {
      const pod = new Pod();
      expect(pod.getRegions()).toEqual([]);
    });
    it("returns correct region for one instance", () => {
      const pod = new Pod({ instances: [{ agentRegion: "Region-1" }] });
      expect(pod.getRegions()).toEqual(["Region-1"]);
    });
    it("returns correct region for multiple instance", () => {
      const pod = new Pod({
        instances: [
          { agentRegion: "Region-1" },
          { agentRegion: "Region-2" },
          { agentRegion: "Region-1" }
        ]
      });
      expect(pod.getRegions()).toEqual(["Region-1", "Region-2"]);
    });
  });

  describe("#getInstancesCount", () => {
    it("passes through from specs", () => {
      const pod = new Pod(PodFixture);
      expect(pod.getInstancesCount()).toEqual(
        pod.getSpec().getScalingInstances()
      );
    });
  });

  describe("#getVersion", () => {
    it("returns correct version", () => {
      const pod = new Pod({
        spec: {
          version: "2016-03-22T10:46:07.354Z"
        }
      });

      expect(pod.getVersion()).toEqual("2016-03-22T10:46:07.354Z");
    });
  });

  describe("#getLabels", () => {
    it("passes through from specs", () => {
      const pod = new Pod(PodFixture);
      expect(pod.getLabels()).toEqual(pod.getSpec().getLabels());
    });
  });

  describe("#getMesosId", () => {
    it("returns correct id", () => {
      const pod = new Pod({
        id: "/test/cmd"
      });

      expect(pod.getMesosId()).toEqual("test_cmd");
    });
  });

  describe("#getResources", () => {
    it("returns correct resource data", () => {
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

    it("multiplies resources by the number of instances", () => {
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

  describe("#getServiceStatus", () => {
    it("detects STOPPED", () => {
      const pod = new Pod({
        spec: {
          scaling: {
            kind: "fixed",
            instances: 0
          }
        },
        instances: []
      });

      expect(pod.getServiceStatus()).toEqual(ServiceStatus.STOPPED);
    });

    it("detects DEPLOYING", () => {
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

    it("detects RUNNING", () => {
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

    it("detects NA", () => {
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

  describe("#getTasksSummary", () => {
    it("counts healthy instances", () => {
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
                conditions: [
                  {
                    lastChanged: "2019-01-01T12:00:00.000Z",
                    lastUpdated: "2019-01-01T12:00:00.000Z",
                    name: "healthy",
                    reason: "health-reported-by-mesos",
                    value: "true"
                  }
                ]
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

    it("counts unhealthy instances", () => {
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
                conditions: [
                  {
                    lastChanged: "2019-01-01T12:00:00.000Z",
                    lastUpdated: "2019-01-01T12:00:00.000Z",
                    name: "healthy",
                    reason: "health-reported-by-mesos",
                    value: "false"
                  }
                ]
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

    it("counts unknown instances", () => {
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
                conditions: [
                  {
                    lastChanged: "2019-01-01T12:00:00.000Z",
                    lastUpdated: "2019-01-01T12:00:00.000Z",
                    name: "something-else",
                    reason: "health-reported-by-mesos",
                    value: "true"
                  }
                ]
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

    it("counts staged instances", () => {
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

    it("counts over-capacity instances", () => {
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
                conditions: [
                  {
                    lastChanged: "2019-01-01T12:00:00.000Z",
                    lastUpdated: "2019-01-01T12:00:00.000Z",
                    name: "something-else",
                    reason: "health-reported-by-mesos",
                    value: "true"
                  }
                ]
              }
            ]
          },
          {
            status: "stable",
            containers: [
              {
                status: "stable",
                conditions: [
                  {
                    lastChanged: "2019-01-01T12:00:00.000Z",
                    lastUpdated: "2019-01-01T12:00:00.000Z",
                    name: "something-else",
                    reason: "health-reported-by-mesos",
                    value: "true"
                  }
                ]
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

  describe("#findInstanceByTaskId", () => {
    it("returns PodInstance", () => {
      const pod = new Pod({
        instances: [
          {
            id: "foo_bar.53678488-2775-11e8-88a0-7abb83ecf42a"
          }
        ]
      });

      expect(
        pod.findInstanceByTaskId(
          "foo_bar.53678488-2775-11e8-88a0-7abb83ecf42a.container-1"
        )
      ).toEqual(
        new PodInstance({
          id: "foo_bar.53678488-2775-11e8-88a0-7abb83ecf42a"
        })
      );
    });

    it("returns undefined", () => {
      const pod = new Pod({
        instances: [
          {
            id: "foo.53678488-2775-11e8-88a0-7abb83ecf42a"
          }
        ]
      });

      expect(
        pod.findInstanceByTaskId(
          "unknown.53678488-2775-11e8-88a0-7abb83ecf42a.container-1"
        )
      ).toEqual(undefined);
    });
  });
  describe("#isDelayed", () => {
    it("return false when not delayed", () => {
      const pod = new Pod({
        queue: {
          delay: {
            overdue: true
          }
        }
      });
      expect(pod.isDelayed()).toEqual(false);
    });

    it("return false when property is missing", () => {
      const pod = new Pod({
        queue: {
          delay: {}
        }
      });
      expect(pod.isDelayed()).toEqual(false);
    });

    it("return true when delayed", () => {
      const pod = new Pod({
        queue: {
          delay: {
            overdue: false
          }
        }
      });
      expect(pod.isDelayed()).toEqual(true);
    });
  });
});
