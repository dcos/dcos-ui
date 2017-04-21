jest.dontMock("../MesosStateStore");

const MesosStateUtil = require("../../utils/MesosStateUtil");
const Pod = require("../../../../plugins/services/src/js/structs/Pod");
const Framework = require("../../../../plugins/services/src/js/structs/Framework");
const MesosStateStore = require("../MesosStateStore");
const Application = require("../../../../plugins/services/src/js/structs/Application");
const Task = require("../../../../plugins/services/src/js/structs/Task");

const MESOS_STATE_WITH_HISTORY = require("../../utils/__tests__/fixtures/MesosStateWithHistory");

describe("MesosStateStore", function() {
  describe("#getTaskFromServiceName", function() {
    beforeEach(function() {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              name: "marathon",
              tasks: [1, 2, 3]
            }
          ]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = this.get;
    });

    it("should return tasks of service with name that matches", function() {
      var result = MesosStateStore.getTasksFromServiceName("marathon");
      expect(result).toEqual([1, 2, 3]);
    });

    it("should null if no service matches", function() {
      var result = MesosStateStore.getTasksFromServiceName("nonExistent");
      expect(result).toEqual([]);
    });
  });

  describe("#getTasksByService", function() {
    beforeEach(function() {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              name: "marathon",
              tasks: [
                { name: "spark", id: "spark.1" },
                { name: "alpha", id: "alpha.1" },
                { name: "alpha", id: "alpha.2" }
              ],
              completed_tasks: [{ name: "alpha", id: "alpha.3" }]
            },
            {
              name: "spark",
              tasks: [{ name: "1" }, { name: "2" }],
              completed_tasks: [{ name: "3" }]
            }
          ]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = this.get;
    });

    it("should return matching framework tasks including scheduler tasks", function() {
      var tasks = MesosStateStore.getTasksByService(
        new Framework({
          id: "/spark",
          labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "spark" }
        })
      );
      expect(tasks).toEqual([
        { name: "spark", id: "spark.1" },
        { name: "1" },
        { name: "2" },
        { name: "3" }
      ]);
    });

    it("should return matching application tasks", function() {
      var tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/alpha" })
      );
      expect(tasks).toEqual([
        { name: "alpha", id: "alpha.1" },
        { name: "alpha", id: "alpha.2" },
        { name: "alpha", id: "alpha.3" }
      ]);
    });

    it("should empty task list if no service matches", function() {
      var tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/non-existent" })
      );
      expect(tasks).toEqual([]);
    });
  });

  describe("#getNodeFromID", function() {
    beforeEach(function() {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          slaves: [
            {
              id: "amazon-thing",
              fakeProp: "fake"
            }
          ]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = this.get;
    });

    it("should return the node with the correct ID", function() {
      var result = MesosStateStore.getNodeFromID("amazon-thing");
      expect(result.fakeProp).toEqual("fake");
    });

    it("should return null if node not found", function() {
      var result = MesosStateStore.getNodeFromID("nonExistentNode");
      expect(result).toEqual(undefined);
    });
  });

  describe("#getTaskFromTaskID", function() {
    beforeEach(function() {
      this.get = MesosStateStore.get;
      const data = {
        frameworks: [
          {
            tasks: [{ id: 1 }],
            completed_tasks: [{ id: 2 }]
          }
        ]
      };
      MesosStateStore.processStateSuccess(data);
      const taskCache = MesosStateStore.indexTasksByID(data);
      MesosStateStore.get = function(id) {
        if (id === "taskCache") {
          return taskCache;
        }

        return data;
      };
    });

    afterEach(function() {
      MesosStateStore.get = this.get;
    });

    it("should return null from an unknown task ID", function() {
      var result = MesosStateStore.getTaskFromTaskID("not-a-task-id");
      expect(result).toBeNull();
    });

    it("should return an instance of Task", function() {
      var result = MesosStateStore.getTaskFromTaskID(1);
      expect(result instanceof Task).toBeTruthy();
    });

    it("should find a currently running task", function() {
      var result = MesosStateStore.getTaskFromTaskID(1);
      expect(result.get()).toEqual({ id: 1 });
    });

    it("should find a completed task", function() {
      var result = MesosStateStore.getTaskFromTaskID(2);
      expect(result.get()).toEqual({ id: 2 });
    });
  });

  describe("#getSchedulerTasks", function() {
    beforeEach(function() {
      this.get = MesosStateStore.get;
    });

    afterEach(function() {
      MesosStateStore.get = this.get;
    });

    it("should return scheduler tasks", function() {
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              name: "marathon",
              tasks: [
                {
                  id: "foo",
                  labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "foo" }]
                },
                {
                  id: "bar"
                },
                {
                  id: "baz",
                  labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "baz" }]
                }
              ]
            }
          ]
        };
      };

      const schedulerTasks = MesosStateStore.getSchedulerTasks();
      expect(schedulerTasks).toEqual([
        {
          id: "foo",
          labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "foo" }]
        },
        {
          id: "baz",
          labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "baz" }]
        }
      ]);
    });

    it("should not return plain tasks", function() {
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              name: "marathon",
              tasks: [
                {
                  id: "foo"
                }
              ]
            }
          ]
        };
      };

      const schedulerTasks = MesosStateStore.getSchedulerTasks();
      expect(schedulerTasks).toEqual([]);
    });
  });

  describe("#getSchedulerTaskFromServiceName", function() {
    beforeEach(function() {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              name: "marathon",
              tasks: [
                {
                  id: "foo",
                  labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "foo" }]
                },
                {
                  id: "bar"
                }
              ]
            }
          ]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = this.get;
    });

    it("should return the matching scheduler task", function() {
      const schedulerTask = MesosStateStore.getSchedulerTaskFromServiceName(
        "foo"
      );

      expect(schedulerTask).toEqual({
        id: "foo",
        labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "foo" }]
      });
    });

    it("should return undefined if no matching scheduler task was found", function() {
      const schedulerTask = MesosStateStore.getSchedulerTaskFromServiceName(
        "bar"
      );

      expect(schedulerTask).toEqual(undefined);
    });
  });

  describe("#getPodHistoricalInstances", function() {
    beforeEach(function() {
      this.get = MesosStateStore.get;
      MesosStateStore.get = () => {
        return MESOS_STATE_WITH_HISTORY;
      };
    });

    afterEach(function() {
      MesosStateStore.get = this.get;
    });

    it("should pass-through to MesosStateUtil.getPodHistoricalInstances", function() {
      var pod = new Pod({ id: "/pod-p0" });
      var result = MesosStateStore.getPodHistoricalInstances(pod);
      var expected = MesosStateUtil.getPodHistoricalInstances(
        MESOS_STATE_WITH_HISTORY,
        pod
      );
      expect(result).toEqual(expected);
    });
  });
});
