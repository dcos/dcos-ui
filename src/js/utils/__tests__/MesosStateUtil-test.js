const MesosStateUtil = require("../MesosStateUtil");
const Pod = require("../../../../plugins/services/src/js/structs/Pod");

const MESOS_STATE_WITH_HISTORY = require("./fixtures/MesosStateWithHistory");

describe("MesosStateUtil", function() {
  describe("#flagMarathonTasks", function() {
    it("returns state when frameworks is undefined", function() {
      expect(MesosStateUtil.flagMarathonTasks({})).toEqual({});
    });

    it("returns state when there's no Marathon", function() {
      const state = {
        frameworks: [
          {
            name: "spark",
            id: "spark_1"
          }
        ],
        tasks: [
          { name: "1", framework_id: "spark_1" },
          { name: "2", framework_id: "spark_1" }
        ]
      };

      expect(MesosStateUtil.flagMarathonTasks(state)).toEqual({
        frameworks: [
          {
            name: "spark",
            id: "spark_1"
          }
        ],
        tasks: [
          { name: "1", framework_id: "spark_1" },
          { name: "2", framework_id: "spark_1" }
        ]
      });
    });

    it("should assign a isStartedByMarathon flag to all tasks", function() {
      const state = {
        frameworks: [
          {
            name: "marathon",
            id: "marathon_1"
          },
          {
            name: "spark",
            id: "spark_1"
          }
        ],
        tasks: [
          { name: "spark", framework_id: "marathon_1", id: "spark.1" },
          { name: "alpha", framework_id: "marathon_1", id: "alpha.1" },
          { name: "alpha", framework_id: "marathon_1", id: "alpha.2" },
          { name: "1", framework_id: "spark_1" },
          { name: "2", framework_id: "spark_1" }
        ]
      };

      expect(MesosStateUtil.flagMarathonTasks(state)).toEqual({
        frameworks: [
          {
            name: "marathon",
            id: "marathon_1"
          },
          {
            name: "spark",
            id: "spark_1"
          }
        ],
        tasks: [
          {
            name: "spark",
            id: "spark.1",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },
          {
            name: "alpha",
            id: "alpha.1",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },
          {
            name: "alpha",
            id: "alpha.2",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },

          { name: "1", framework_id: "spark_1", isStartedByMarathon: false },
          { name: "2", framework_id: "spark_1", isStartedByMarathon: false }
        ]
      });
    });
  });

  describe("#getFramework", function() {
    const state = {
      frameworks: [
        {
          id: "framework-123",
          name: "test-1"
        },
        {
          id: "framework-abc",
          name: "test-2"
        }
      ]
    };

    it("should return the matching framework", function() {
      expect(MesosStateUtil.getFramework(state, "framework-123").name).toEqual(
        "test-1"
      );
    });

    it('should return the matching "completed" framework', function() {
      expect(MesosStateUtil.getFramework(state, "framework-abc").name).toEqual(
        "test-2"
      );
    });

    it("should return nothing if no matching framework was found", function() {
      expect(MesosStateUtil.getFramework(state, "unknown")).not.toBeDefined();
    });
  });

  describe("#getRunningTasksFromVirtualNetworkName", function() {
    beforeEach(function() {
      this.instance = MesosStateUtil.getRunningTasksFromVirtualNetworkName(
        {
          frameworks: [
            { id: "foo" },
            { id: "bar" },
            { id: "baz" },
            { id: "qux" }
          ],
          tasks: [
            {
              state: "TASK_RUNNING",
              container: { network_infos: [{ name: "alpha" }] }
            },
            {
              state: "TASK_KILLED",
              container: { network_infos: [{ name: "alpha" }] }
            },
            {
              state: "TASK_RUNNING",
              container: { network_infos: [{ name: "beta" }] }
            }
          ]
        },
        "alpha"
      );
    });

    it("should handle empty object well", function() {
      expect(
        MesosStateUtil.getRunningTasksFromVirtualNetworkName({}, "foo")
      ).toEqual([]);
    });

    it("should throw when a null state is provided", function() {
      expect(function() {
        MesosStateUtil.getRunningTasksFromVirtualNetworkName(null, "foo");
      }).toThrow();
    });

    it("should handle empty undefined well", function() {
      expect(
        MesosStateUtil.getRunningTasksFromVirtualNetworkName(undefined, "foo")
      ).toEqual([]);
    });

    it("should filter running tasks that doesn't have the overlay name", function() {
      expect(this.instance.length).toEqual(1);
    });

    it("should find running tasks from different frameworks", function() {
      expect(this.instance).toEqual([
        {
          state: "TASK_RUNNING",
          container: { network_infos: [{ name: "alpha" }] }
        }
      ]);
    });
  });

  describe("#getPodHistoricalInstances", function() {
    const state = MESOS_STATE_WITH_HISTORY;

    it("should correctly return only pod-related tasks", function() {
      const pod = new Pod({ id: "/pod-p0" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances.length).toEqual(2);
      expect(instances[0].id).toEqual("pod-p0.instance-inst-a1");
      expect(instances[1].id).toEqual("pod-p0.instance-inst-a2");
    });

    it("should add `containerID` property on containers", function() {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].containerId).toEqual(
        "pod-p1.instance-inst-a1.container-c1"
      );
    });

    it("should add `status` property on containers", function() {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].status).toEqual("TASK_FINISHED");
    });

    it("should add `lastChanged` property on containers", function() {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].lastChanged).toEqual(1008 * 1000);
    });

    it("should add `lastUpdated` property on containers", function() {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].lastUpdated).toEqual(1008 * 1000);
    });

    it("should correctly summarize resources", function() {
      const pod = new Pod({ id: "/pod-p0" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances.length).toEqual(2);
      expect(instances[0].resources).toEqual({
        cpus: 0.4,
        mem: 48,
        disk: 16,
        gpus: 0
      });
      expect(instances[1].resources).toEqual({
        cpus: 0.1,
        mem: 16,
        disk: 0,
        gpus: 1
      });
    });

    it("should pick the latest timestamp for lastChanged", function() {
      const pod = new Pod({ id: "/pod-p0" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances.length).toEqual(2);
      expect(instances[0].lastChanged).toEqual(1006 * 1000);
      expect(instances[0].lastUpdated).toEqual(1006 * 1000);
      expect(instances[1].lastChanged).toEqual(1007 * 1000);
      expect(instances[1].lastUpdated).toEqual(1007 * 1000);
    });
  });

  describe("#isPodTaskId", function() {
    it("should correctly match pod (PodDefinition) task ID", function() {
      expect(
        MesosStateUtil.isPodTaskId("podname.instance-instancename.taskname")
      ).toBeTruthy();
    });

    it("should not match marathon (AppDefinition) task ID", function() {
      expect(
        MesosStateUtil.isPodTaskId("podname.marathon-instancename.taskname")
      ).toBeFalsy();
    });

    it("should not match anything else that looks close", function() {
      expect(
        MesosStateUtil.isPodTaskId("podname.marathon-instancename")
      ).toBeFalsy();
      expect(
        MesosStateUtil.isPodTaskId("marathon-instancename.taskname")
      ).toBeFalsy();
      expect(
        MesosStateUtil.isPodTaskId(
          "podname.marathon-instancename.taskname.junk"
        )
      ).toBeFalsy();
      expect(
        MesosStateUtil.isPodTaskId(
          "junk.podname.marathon-instancename.taskname"
        )
      ).toBeFalsy();
    });
  });

  describe("#decomposePodTaskId", function() {
    it("should correctly de-compose", function() {
      expect(
        MesosStateUtil.decomposePodTaskId(
          "podname.instance-instancename.taskname"
        )
      ).toEqual({
        podID: "podname",
        instanceID: "instancename",
        taskName: "taskname"
      });
    });
  });

  describe("#getHostResourcesByFramework", function() {
    beforeEach(function() {
      this.mesosState = {
        frameworks: [
          {
            name: "marathon",
            id: "marathon_1"
          },
          {
            name: "spark",
            id: "spark_1"
          }
        ],
        tasks: [
          {
            name: "spark",
            framework_id: "marathon_1",
            id: "spark.1",
            slave_id: "slave-uid",
            resources: { cpus: 1, mem: 128, disk: 100 }
          },
          {
            name: "spark",
            framework_id: "marathon_1",
            id: "spark.2",
            slave_id: "slave-uid",
            resources: { cpus: 1, mem: 128, disk: 100 }
          },
          {
            name: "alpha",
            framework_id: "marathon_2",
            id: "alpha.2",
            slave_id: "slave-uid",
            resources: { cpus: 0.5, mem: 256, disk: 150 }
          },
          {
            name: "nginx",
            framework_id: "marathon_3",
            id: "nginx.1",
            slave_id: "slave-uid",
            resources: { cpus: 1, mem: 128, disk: 100 }
          }
        ]
      };
    });

    it("aggregates resources by framework", function() {
      expect(
        MesosStateUtil.getHostResourcesByFramework(this.mesosState)
      ).toEqual({
        "slave-uid": {
          marathon_1: {
            cpus: 2,
            mem: 256,
            disk: 200
          },
          marathon_2: {
            cpus: 0.5,
            mem: 256,
            disk: 150
          },
          marathon_3: {
            cpus: 1,
            mem: 128,
            disk: 100
          }
        }
      });
    });

    it("groups filtered frameworks into other", function() {
      const filteredFrameworks = ["marathon_2", "marathon_3"];
      expect(
        MesosStateUtil.getHostResourcesByFramework(
          this.mesosState,
          filteredFrameworks
        )
      ).toEqual({
        "slave-uid": {
          marathon_1: {
            cpus: 2,
            mem: 256,
            disk: 200
          },
          other: {
            cpus: 1.5,
            mem: 384,
            disk: 250
          }
        }
      });
    });

    it("ignores tasks on termination states", function() {
      this.mesosState.tasks.push({
        name: "spark",
        framework_id: "marathon_1",
        id: "spark.4",
        slave_id: "slave-uid",
        state: "TASK_FAILED",
        resources: { cpus: 1, mem: 128, disk: 100 }
      });
      expect(
        MesosStateUtil.getHostResourcesByFramework(this.mesosState)
      ).toEqual({
        "slave-uid": {
          marathon_1: {
            cpus: 2,
            mem: 256,
            disk: 200
          },
          marathon_2: {
            cpus: 0.5,
            mem: 256,
            disk: 150
          },
          marathon_3: {
            cpus: 1,
            mem: 128,
            disk: 100
          }
        }
      });
    });
  });
});
