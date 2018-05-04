const Pod = require("#PLUGINS/services/src/js/structs/Pod");
const Framework = require("#PLUGINS/services/src/js/structs/Framework");
const Application = require("#PLUGINS/services/src/js/structs/Application");
const Task = require("#PLUGINS/services/src/js/structs/Task");
const MesosStateUtil = require("../../utils/MesosStateUtil");
const MesosStateStore = require("../MesosStateStore");

const MESOS_STATE_WITH_HISTORY = require("../../utils/__tests__/fixtures/MesosStateWithHistory");

let thisGet, thisGetFrameworkToServicesMap;

describe("MesosStateStore", function() {
  describe("#getTasksFromServiceName", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              active: true,
              name: "marathon"
            }
          ],
          tasks: [1, 2, 3]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("returns tasks of service with name that matches", function() {
      var result = MesosStateStore.getTasksFromServiceName("marathon");
      expect(result).toEqual([1, 2, 3]);
    });

    it("returns empty array if no service matches", function() {
      var result = MesosStateStore.getTasksFromServiceName("nonExistent");
      expect(result).toEqual([]);
    });

    it("returns empty array for an invalid state", function() {
      MesosStateStore.get = () => null;
      var result = MesosStateStore.getTasksFromServiceName("marathon");
      expect(result).toEqual([]);
    });
  });

  describe("#getLastMesosState", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    describe("fills empty fields with empty arrays", function() {
      const testCases = [
        [],
        ["tasks"],
        ["frameworks", "slaves"],
        ["frameworks", "tasks", "executors"]
      ];
      const allFields = ["tasks", "frameworks", "slaves", "executors"];

      testCases.map(function(testCase) {
        it(`when [${testCase.join(", ")}] are set`, function() {
          const returnObj = {};
          testCase.forEach(field => (returnObj[field] = [{}]));
          MesosStateStore.get = () => returnObj;

          const lastState = MesosStateStore.getLastMesosState();

          // eslint-disable-next-line guard-for-in
          allFields.forEach(field =>
            expect(lastState[field].length).toBe(
              testCase.includes(field) ? 1 : 0
            )
          );
        });
      });
    });

    it("returns the original state if its complete", function() {
      MesosStateStore.get = () => ({
        tasks: [{}],
        frameworks: [{}],
        slaves: [{}],
        executors: [{}]
      });

      const lastState = MesosStateStore.getLastMesosState();
      expect(lastState.tasks.length).toBe(1);
      expect(lastState.frameworks.length).toBe(1);
      expect(lastState.slaves.length).toBe(1);
      expect(lastState.executors.length).toBe(1);
    });
  });

  describe("#getServiceFromName", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("returns undefined on empty state", function() {
      MesosStateStore.get = () => null;
      expect(MesosStateStore.getServiceFromName("unknown")).toBeUndefined();

      MesosStateStore.get = () => ({});
      expect(MesosStateStore.getServiceFromName("unknown")).toBeUndefined();
    });

    it("returns the service with the name", function() {
      MesosStateStore.get = () => ({
        frameworks: [
          { name: "marathon" },
          { name: "zipkin", id: "zipkin_1" },
          { name: "cassandra" }
        ]
      });

      expect(MesosStateStore.getServiceFromName("zipkin")).toEqual({
        name: "zipkin",
        id: "zipkin_1"
      });
    });
  });

  describe("#getTasksByService", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              name: "marathon",
              id: "marathon_1",
              active: true
            },
            {
              name: "spark",
              id: "spark_0",
              active: false
            },
            {
              name: "spark",
              id: "spark_1",
              active: true
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
            {
              name: "alpha",
              id: "alpha.3",
              framework_id: "marathon_1",
              isStartedByMarathon: true
            },
            { name: "1", framework_id: "spark_1" },
            { name: "2", framework_id: "spark_1" },
            { name: "3", framework_id: "spark_1" }
          ]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("returns matching framework tasks including scheduler tasks", function() {
      var tasks = MesosStateStore.getTasksByService(
        new Framework({
          id: "/spark",
          labels: {
            DCOS_PACKAGE_NAME: "spark",
            DCOS_PACKAGE_FRAMEWORK_NAME: "spark",
            DCOS_PACKAGE_VERSION: "v1"
          }
        })
      );
      expect(tasks).toEqual([
        {
          name: "spark",
          id: "spark.1",
          framework_id: "marathon_1",
          isStartedByMarathon: true
        },
        { name: "1", framework_id: "spark_1" },
        { name: "2", framework_id: "spark_1" },
        { name: "3", framework_id: "spark_1" }
      ]);
    });

    it("returns matching application tasks", function() {
      var tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/alpha" })
      );
      expect(tasks).toEqual([
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
        {
          name: "alpha",
          id: "alpha.3",
          framework_id: "marathon_1",
          isStartedByMarathon: true
        }
      ]);
    });

    it("empties task list if no service matches", function() {
      var tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/non-existent" })
      );
      expect(tasks).toEqual([]);
    });

    it("returns empty list for invalid state with applications", function() {
      MesosStateStore.get = () => null;
      var tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/alpha" })
      );
      expect(tasks).toEqual([]);
    });

    it("returns empty list for invalid state with frameworks", function() {
      MesosStateStore.get = () => null;
      var tasks = MesosStateStore.getTasksByService(
        new Framework({
          id: "/spark",
          labels: {
            DCOS_PACKAGE_NAME: "spark",
            DCOS_PACKAGE_FRAMEWORK_NAME: "spark",
            DCOS_PACKAGE_VERSION: "v1"
          }
        })
      );
      expect(tasks).toEqual([]);
    });

    it("flags SDK tasks", function() {
      var tasks = MesosStateStore.getTasksByService(
        new Framework({
          id: "/spark",
          labels: {
            DCOS_COMMONS_API_VERSION: 1,
            DCOS_PACKAGE_NAME: "spark",
            DCOS_PACKAGE_FRAMEWORK_NAME: "spark",
            DCOS_PACKAGE_VERSION: "v1"
          }
        })
      );
      expect(tasks).toEqual([
        {
          name: "spark",
          id: "spark.1",
          framework_id: "marathon_1",
          isStartedByMarathon: true,
          sdkTask: true
        },
        {
          name: "1",
          framework_id: "spark_1",
          sdkTask: true
        },
        {
          name: "2",
          framework_id: "spark_1",
          sdkTask: true
        },
        {
          name: "3",
          framework_id: "spark_1",
          sdkTask: true
        }
      ]);
    });
  });

  describe("#getNodeFromID", function() {
    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    describe("when slave isn't falsey", function() {
      beforeEach(function() {
        thisGet = MesosStateStore.get;
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

      it("returns the node with the correct ID", function() {
        var result = MesosStateStore.getNodeFromID("amazon-thing");
        expect(result.fakeProp).toEqual("fake");
      });

      it("returns undefined if node not found", function() {
        var result = MesosStateStore.getNodeFromID("nonExistentNode");
        expect(result).toBeUndefined();
      });
    });

    describe("when slave is falsey", function() {
      beforeEach(function() {
        thisGet = MesosStateStore.get;
        MesosStateStore.set({
          lastMesosState: {
            slaves: null
          }
        });
      });

      it("returns null with invalid state", function() {
        var result = MesosStateStore.getNodeFromID("nonExistentNode");
        expect(result).toBeNull();
      });
    });
  });

  describe("#getNodeFromHostname", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          slaves: [
            {
              id: "amazon-thing",
              fakeProp: "fake",
              hostname: "my-host"
            }
          ]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("returns the node with the correct hostname", function() {
      var result = MesosStateStore.getNodeFromHostname("my-host");
      expect(result.fakeProp).toEqual("fake");
    });

    it("returns undefined if node not found", function() {
      var result = MesosStateStore.getNodeFromHostname("nonExistentNode");
      expect(result).toEqual(undefined);
    });

    it("returns null with invalid state", function() {
      MesosStateStore.get = () => null;

      var result = MesosStateStore.getNodeFromHostname("nonExistentNode");
      expect(result).toEqual(undefined);
    });
  });

  describe("#getTasksFromNodeID", function() {
    it("doesn't fail with invalid state", function() {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => null;

      var result = MesosStateStore.getTasksFromNodeID("my-id");
      expect(result).toEqual([]);

      MesosStateStore.get = thisGet;
    });

    it("flags SDK tasks", function() {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => ({
        tasks: [
          { id: 1, framework_id: "foo", slave_id: "node-1" },
          { id: 2, framework_id: "bar", slave_id: "node-1" }
        ]
      });

      thisGetFrameworkToServicesMap = MesosStateUtil.getFrameworkToServicesMap;
      MesosStateUtil.getFrameworkToServicesMap = () => ({
        foo: new Framework({ labels: { DCOS_COMMONS_API_VERSION: 1 } })
      });

      var result = MesosStateStore.getTasksFromNodeID("node-1");
      expect(result).toEqual([
        { id: 1, framework_id: "foo", sdkTask: true, slave_id: "node-1" },
        { id: 2, framework_id: "bar", slave_id: "node-1" }
      ]);

      MesosStateStore.get = thisGet;
      MesosStateUtil.getFrameworkToServicesMap = thisGetFrameworkToServicesMap;
    });
  });

  describe("#getRunningTasksFromVirtualNetworkName", function() {
    it("doesn't throw on invalid state", function() {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => null;

      var result = MesosStateStore.getRunningTasksFromVirtualNetworkName(
        "overlayName"
      );
      expect(result).toEqual([]);

      MesosStateStore.get = thisGet;
    });
  });

  describe("#getTaskFromTaskID", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
      const data = {
        frameworks: [{}],
        tasks: [{ id: 1 }, { id: 2 }]
      };

      MesosStateStore.get = function() {
        return data;
      };
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("returns null from an unknown task ID", function() {
      var result = MesosStateStore.getTaskFromTaskID("not-a-task-id");
      expect(result).toBeNull();
    });

    it("returns an instance of Task", function() {
      var result = MesosStateStore.getTaskFromTaskID(1);
      expect(result instanceof Task).toBeTruthy();
    });

    it("finds a currently running task", function() {
      var result = MesosStateStore.getTaskFromTaskID(1);
      expect(result.get()).toEqual({ id: 1 });
    });

    it("finds a completed task", function() {
      var result = MesosStateStore.getTaskFromTaskID(2);
      expect(result.get()).toEqual({ id: 2 });
    });
  });

  describe("#getSchedulerTasks", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("returns scheduler tasks", function() {
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              active: true,
              name: "marathon"
            }
          ],
          tasks: [
            {
              id: "foo",
              isSchedulerTask: true
            },
            {
              id: "bar"
            },
            {
              id: "baz",
              isSchedulerTask: true
            }
          ]
        };
      };

      const schedulerTasks = MesosStateStore.getSchedulerTasks();
      expect(schedulerTasks).toEqual([
        {
          id: "foo",
          isSchedulerTask: true
        },
        {
          id: "baz",
          isSchedulerTask: true
        }
      ]);
    });

    it("does not return plain tasks", function() {
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              active: true,
              name: "marathon"
            }
          ],
          tasks: [
            {
              id: "foo"
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
      thisGet = MesosStateStore.get;
      MesosStateStore.get = function() {
        return {
          frameworks: [
            {
              active: true,
              name: "marathon"
            }
          ],
          tasks: [
            {
              id: "foo",
              labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "foo" }],
              isSchedulerTask: true
            },
            {
              id: "bar"
            }
          ]
        };
      };
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("returns the matching scheduler task", function() {
      const schedulerTask = MesosStateStore.getSchedulerTaskFromServiceName(
        "foo"
      );

      expect(schedulerTask).toEqual({
        id: "foo",
        labels: [{ key: "DCOS_PACKAGE_FRAMEWORK_NAME", value: "foo" }],
        isSchedulerTask: true
      });
    });

    it("returns undefined if no matching scheduler task was found", function() {
      const schedulerTask = MesosStateStore.getSchedulerTaskFromServiceName(
        "bar"
      );

      expect(schedulerTask).toEqual(undefined);
    });
  });

  describe("#getPodHistoricalInstances", function() {
    beforeEach(function() {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => {
        return MESOS_STATE_WITH_HISTORY;
      };
    });

    afterEach(function() {
      MesosStateStore.get = thisGet;
    });

    it("passes through to MesosStateUtil.getPodHistoricalInstances", function() {
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
