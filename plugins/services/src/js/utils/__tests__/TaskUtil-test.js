jest.mock("#SRC/js/structs/CompositeState");

const Node = require("#SRC/js/structs/Node");
const NodesList = require("#SRC/js/structs/NodesList");
const CompositeState = require("#SRC/js/structs/CompositeState");

const TaskUtil = require("../TaskUtil");
const MasterNodeLocal = require("./fixtures/MasterNodeLocal.json");
const MasterNodeOffsite = require("./fixtures/MasterNodeOffsite.json");
const SlaveNodes = require("./fixtures/SlaveNodes.json");
const NodeTask = require("./fixtures/NodeTask.json");

let thisInstance;

describe("TaskUtil", function() {
  describe("#getHostAndPortList", function() {
    it("returns empty arrays if host and ports are not available", function() {
      expect(TaskUtil.getHostAndPortList()).toEqual({ ports: [], hosts: [] });
    });

    it("uses ips if network is BRIDGE and no port_mappings", function() {
      expect(
        TaskUtil.getHostAndPortList(
          {
            discovery: { ports: { ports: [{ number: 3 }] } },
            statuses: [
              {
                container_status: {
                  network_infos: [{ ip_addresses: [{ ip_address: "bar" }] }]
                }
              }
            ],
            container: { type: "FOO", foo: { network: "BRIDGE" } }
          },
          new Node({ hostname: "quis" })
        )
      ).toEqual({ ports: [3], hosts: ["bar"] });
    });

    it("uses port_mappings if set and network is BRIDGE", function() {
      expect(
        TaskUtil.getHostAndPortList(
          {
            container: {
              type: "FOO",
              foo: {
                port_mappings: [{ host_port: "foo" }, { host_port: "bar" }],
                network: "BRIDGE"
              }
            }
          },
          new Node({ hostname: "quis" })
        )
      ).toEqual({ ports: ["foo", "bar"], hosts: ["quis"] });
    });

    it("uses host name if network is HOST", function() {
      expect(
        TaskUtil.getHostAndPortList(
          { discovery: { ports: { ports: [{ number: 3 }] } } },
          new Node({ hostname: "foo" })
        )
      ).toEqual({ ports: [3], hosts: ["foo"] });
    });
  });

  describe("#getPorts", function() {
    it("returns task ports if discovery ports are not defined", function() {
      expect(TaskUtil.getPorts({ ports: [1, 2] })).toEqual([1, 2]);
    });

    it("returns an empty array if neither are defined", function() {
      expect(TaskUtil.getPorts()).toEqual([]);
    });

    it("uses discovery ports if available", function() {
      const result = TaskUtil.getPorts({
        discovery: { ports: { ports: [{ number: 3 }] } }
      });

      expect(result).toEqual([3]);
    });

    it("prefers discovery ports if both are available", function() {
      const result = TaskUtil.getPorts({
        ports: [1, 2],
        discovery: { ports: { ports: [{ number: 3 }] } }
      });

      expect(result).toEqual([3]);
    });
  });

  describe("#getPortMappings", function() {
    beforeEach(function() {
      thisInstance = TaskUtil.getPortMappings({
        container: {
          type: "FOO",
          foo: { port_mappings: ["foo", "bar", "baz"] }
        }
      });
    });

    it("handles empty container well", function() {
      expect(TaskUtil.getPortMappings({})).toEqual(null);
    });

    it("handles empty type well", function() {
      expect(TaskUtil.getPortMappings({ container: {} })).toEqual(null);
    });

    it("handles empty info well", function() {
      expect(TaskUtil.getPortMappings({ container: { type: "FOO" } })).toEqual(
        null
      );
    });

    it("handles empty port mappings well", function() {
      expect(
        TaskUtil.getPortMappings({ container: { type: "FOO", foo: {} } })
      ).toEqual(null);
    });

    it("handles if port mappings are is not an array", function() {
      expect(
        TaskUtil.getPortMappings({
          container: { type: "FOO", foo: { port_mappings: 0 } }
        })
      ).toEqual(null);
    });

    it("provides port_mappings when available", function() {
      expect(thisInstance).toEqual(["foo", "bar", "baz"]);
    });
  });

  describe("#getRegionName", function() {
    beforeEach(function() {
      CompositeState.getNodesList = () => {
        return new NodesList({ items: SlaveNodes });
      };
      CompositeState.getMasterNode = () => {
        return new Node(MasterNodeLocal);
      };
    });
    it("returns N/A when no region name exists", function() {
      const task = Object.assign({}, NodeTask);
      task.slave_id = "2";
      expect(TaskUtil.getRegionName(task)).toEqual("N/A");
    });
    it("adds (Local) when no slave/ master in the same region", function() {
      expect(TaskUtil.getRegionName(NodeTask)).toEqual("us-west-2 (Local)");
    });
    it("returns region when slave/ master in different region", function() {
      CompositeState.getMasterNode = () => {
        return new Node(MasterNodeOffsite);
      };
      expect(TaskUtil.getRegionName(NodeTask)).toEqual("us-west-2");
    });
  });

  describe("#getZoneName", function() {
    beforeEach(function() {
      CompositeState.getNodesList = () => {
        return new NodesList({ items: SlaveNodes });
      };
    });
    it("returns N/A when no zone name exists", function() {
      const task = Object.assign({}, NodeTask);
      task.slave_id = "2";
      expect(TaskUtil.getZoneName(task)).toEqual("N/A");
    });
    it("returns zone when slave/ master in different zone", function() {
      CompositeState.getMasterNode = () => {
        return new Node(MasterNodeOffsite);
      };
      expect(TaskUtil.getZoneName(NodeTask)).toEqual("us-west-2a");
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
              },
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

        expect(TaskUtil.getTaskPath(state, task)).toEqual("foo/");
      });

      it("gets the task path form a completed task", function() {
        const task = {
          id: "executor-bar",
          framework_id: "framework-123",
          executor_id: "executor-bar"
        };

        expect(TaskUtil.getTaskPath(state, task)).toEqual("bar/");
      });

      it("gets the task path for a task with unknown executor id", function() {
        const task = {
          id: "executor-bar",
          framework_id: "framework-123"
        };

        expect(TaskUtil.getTaskPath(state, task)).toEqual("bar/");
      });

      it("appends provided path", function() {
        const task = {
          id: "executor-bar",
          framework_id: "framework-123"
        };

        expect(TaskUtil.getTaskPath(state, task, "test")).toEqual("bar/test");
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
              },
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

        expect(TaskUtil.getTaskPath(state, task)).toEqual(
          "foo/tasks/task-foo-running/"
        );
      });

      it("gets the task path form a completed task", function() {
        const task = {
          id: "task-foo-completed",
          executor_id: "executor-foo",
          framework_id: "framework-123"
        };

        expect(TaskUtil.getTaskPath(state, task)).toEqual(
          "foo/tasks/task-foo-completed/"
        );
      });

      it("gets the task path form a completed executor", function() {
        const task = {
          id: "task-bar-completed",
          executor_id: "executor-bar",
          framework_id: "framework-123"
        };

        expect(TaskUtil.getTaskPath(state, task)).toEqual(
          "bar/tasks/task-bar-completed/"
        );
      });

      it("appends provided path", function() {
        const task = {
          id: "task-foo-running",
          executor_id: "executor-foo",
          framework_id: "framework-123"
        };

        expect(TaskUtil.getTaskPath(state, task, "test")).toEqual(
          "foo/tasks/task-foo-running/test"
        );
      });
    });
  });
});
