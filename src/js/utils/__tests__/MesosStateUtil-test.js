const MesosStateUtil = require("../MesosStateUtil");
const Pod = require("../../../../plugins/services/src/js/structs/Pod");

const MESOS_STATE_WITH_HISTORY = require("./fixtures/MesosStateWithHistory");

describe("MesosStateUtil", function() {
  describe("#flagMarathonTasks", function() {
    it("should assign a isStartedByMarathon flag to all tasks", function() {
      const state = {
        frameworks: [
          {
            name: "marathon",
            tasks: [
              { name: "spark", id: "spark.1" },
              { name: "alpha", id: "alpha.1" }
            ],
            completed_tasks: [{ name: "alpha", id: "alpha.2" }]
          },
          {
            name: "spark",
            tasks: [{ name: "1" }],
            completed_tasks: [{ name: "2" }]
          }
        ]
      };

      expect(MesosStateUtil.flagMarathonTasks(state)).toEqual({
        frameworks: [
          {
            name: "marathon",
            tasks: [
              { name: "spark", id: "spark.1", isStartedByMarathon: true },
              { name: "alpha", id: "alpha.1", isStartedByMarathon: true }
            ],
            completed_tasks: [
              { name: "alpha", id: "alpha.2", isStartedByMarathon: true }
            ]
          },
          {
            name: "spark",
            tasks: [{ name: "1", isStartedByMarathon: false }],
            completed_tasks: [{ name: "2", isStartedByMarathon: false }]
          }
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
        }
      ],
      completed_frameworks: [
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

  describe("#getTasksFromVirtualNetworkName", function() {
    beforeEach(function() {
      this.instance = MesosStateUtil.getTasksFromVirtualNetworkName(
        {
          frameworks: [
            { id: "foo" },
            { id: "bar" },
            {
              id: "baz",
              tasks: [{ container: { network_infos: [{ name: "alpha" }] } }]
            },
            {
              id: "qux",
              tasks: [
                { container: { network_infos: [{ name: "alpha" }] } },
                { container: { network_infos: [{ name: "beta" }] } }
              ]
            }
          ]
        },
        "alpha"
      );
    });

    it("should handle empty object well", function() {
      expect(MesosStateUtil.getTasksFromVirtualNetworkName({}, "foo")).toEqual(
        []
      );
    });

    it("should throw when a null state is provided", function() {
      expect(function() {
        MesosStateUtil.getTasksFromVirtualNetworkName(null, "foo");
      }).toThrow();
    });

    it("should handle empty undefined well", function() {
      expect(
        MesosStateUtil.getTasksFromVirtualNetworkName(undefined, "foo")
      ).toEqual([]);
    });

    it("should filter tasks that doesn't have the overlay name", function() {
      expect(this.instance.length).toEqual(2);
    });

    it("should find tasks from different frameworks", function() {
      expect(this.instance).toEqual([
        { container: { network_infos: [{ name: "alpha" }] } },
        { container: { network_infos: [{ name: "alpha" }] } }
      ]);
    });
  });

  describe("#getTaskPath", function() {
    describe("app/framework tasks", function() {
      const state = {
        frameworks: [
          {
            id: "framework-123",
            name: "test-1",
            executors: [
              {
                id: "executor-foo",
                directory: "foo"
              }
            ],
            completed_executors: [
              {
                id: "executor-bar",
                directory: "bar"
              }
            ]
          }
        ]
      };

      it("gets the task path for a running task", function() {
        const task = {
          id: "executor-foo",
          framework_id: "framework-123",
          executor_id: "executor-bar"
        };

        expect(MesosStateUtil.getTaskPath(state, task)).toEqual("foo/");
      });

      it("gets the task path form a completed task", function() {
        const task = {
          id: "executor-bar",
          framework_id: "framework-123",
          executor_id: "executor-bar"
        };

        expect(MesosStateUtil.getTaskPath(state, task)).toEqual("bar/");
      });

      it("gets the task path for a task with unknown executor id", function() {
        const task = {
          id: "executor-bar",
          framework_id: "framework-123"
        };

        expect(MesosStateUtil.getTaskPath(state, task)).toEqual("bar/");
      });

      it("appends provided path", function() {
        const task = {
          id: "executor-bar",
          framework_id: "framework-123"
        };

        expect(MesosStateUtil.getTaskPath(state, task, "test")).toEqual(
          "bar/test"
        );
      });
    });

    describe("pod tasks", function() {
      const state = {
        frameworks: [
          {
            id: "framework-123",
            name: "test-1",
            executors: [
              {
                id: "executor-foo",
                directory: "foo",
                completed_tasks: [{ id: "task-foo-completed" }],
                tasks: [{ id: "task-foo-running" }],
                type: "DEFAULT"
              }
            ],
            completed_executors: [
              {
                id: "executor-bar",
                directory: "bar",
                completed_tasks: [{ id: "task-bar-completed" }],
                type: "DEFAULT"
              }
            ]
          }
        ]
      };

      it("gets the task path for a running task", function() {
        const task = {
          id: "task-foo-running",
          executor_id: "executor-foo",
          framework_id: "framework-123"
        };

        expect(MesosStateUtil.getTaskPath(state, task)).toEqual(
          "foo/tasks/task-foo-running/"
        );
      });

      it("gets the task path form a completed task", function() {
        const task = {
          id: "task-foo-completed",
          executor_id: "executor-foo",
          framework_id: "framework-123"
        };

        expect(MesosStateUtil.getTaskPath(state, task)).toEqual(
          "foo/tasks/task-foo-completed/"
        );
      });

      it("gets the task path form a completed executor", function() {
        const task = {
          id: "task-bar-completed",
          executor_id: "executor-bar",
          framework_id: "framework-123"
        };

        expect(MesosStateUtil.getTaskPath(state, task)).toEqual(
          "bar/tasks/task-bar-completed/"
        );
      });

      it("appends provided path", function() {
        const task = {
          id: "task-foo-running",
          executor_id: "executor-foo",
          framework_id: "framework-123"
        };

        expect(MesosStateUtil.getTaskPath(state, task, "test")).toEqual(
          "foo/tasks/task-foo-running/test"
        );
      });
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

      expect(instances[0].containers[0].status).toEqual("TASK_RUNNING");
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
});
