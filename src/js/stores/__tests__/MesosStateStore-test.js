import Pod from "#PLUGINS/services/src/js/structs/Pod";
import Framework from "#PLUGINS/services/src/js/structs/Framework";
import Application from "#PLUGINS/services/src/js/structs/Application";
import Task from "#PLUGINS/services/src/js/structs/Task";
import MesosStateUtil from "../../utils/MesosStateUtil";

import MESOS_STATE_WITH_HISTORY from "../../utils/__tests__/fixtures/MesosStateWithHistory";

const MesosStateStore = require("../MesosStateStore").default;

let thisGet, thisGetFrameworkToServicesMap;

describe("MesosStateStore", () => {
  describe("#getLastMesosState", () => {
    beforeEach(() => {
      thisGet = MesosStateStore.get;
    });

    afterEach(() => {
      MesosStateStore.get = thisGet;
    });

    describe("fills empty fields with empty arrays", () => {
      const testCases = [
        [],
        ["tasks"],
        ["frameworks", "slaves"],
        ["frameworks", "tasks", "executors"]
      ];
      const allFields = ["tasks", "frameworks", "slaves", "executors"];

      testCases.map(testCase => {
        it(`when [${testCase.join(", ")}] are set`, () => {
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

    it("returns the original state if its complete", () => {
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

  describe("#getTasksByService", () => {
    beforeEach(() => {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => ({
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
            id: "spark.instance.1",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },
          {
            name: "alpha",
            id: "alpha.instance.1",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },
          {
            name: "alpha",
            id: "alpha.instance.2",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },
          {
            name: "alpha",
            id: "alpha.instance.3",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },
          {
            name: "alpha",
            id: "pod_alpha.instance.3",
            framework_id: "marathon_1",
            isStartedByMarathon: true
          },
          { name: "1", framework_id: "spark_1" },
          { name: "2", framework_id: "spark_1" },
          { name: "3", framework_id: "spark_1" }
        ]
      });
    });

    afterEach(() => {
      MesosStateStore.get = thisGet;
    });

    it("returns matching framework tasks including scheduler tasks", () => {
      const tasks = MesosStateStore.getTasksByService(
        new Framework({
          id: "/spark",
          labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "spark" }
        })
      );
      expect(tasks).toEqual([
        {
          name: "spark",
          id: "spark.instance.1",
          framework_id: "marathon_1",
          isStartedByMarathon: true
        },
        { name: "1", framework_id: "spark_1" },
        { name: "2", framework_id: "spark_1" },
        { name: "3", framework_id: "spark_1" }
      ]);
    });

    it("returns matching application tasks", () => {
      const tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/alpha" })
      );
      expect(tasks).toEqual([
        {
          name: "alpha",
          id: "alpha.instance.1",
          framework_id: "marathon_1",
          isStartedByMarathon: true
        },
        {
          name: "alpha",
          id: "alpha.instance.2",
          framework_id: "marathon_1",
          isStartedByMarathon: true
        },
        {
          name: "alpha",
          id: "alpha.instance.3",
          framework_id: "marathon_1",
          isStartedByMarathon: true
        }
      ]);
    });

    it("empties task list if no service matches", () => {
      const tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/non-existent" })
      );
      expect(tasks).toEqual([]);
    });

    it("returns empty list for invalid state with applications", () => {
      MesosStateStore.get = () => null;
      const tasks = MesosStateStore.getTasksByService(
        new Application({ id: "/alpha" })
      );
      expect(tasks).toEqual([]);
    });

    it("returns empty list for invalid state with frameworks", () => {
      MesosStateStore.get = () => null;
      const tasks = MesosStateStore.getTasksByService(
        new Framework({
          id: "/spark",
          labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "spark" }
        })
      );
      expect(tasks).toEqual([]);
    });

    it("flags SDK tasks", () => {
      const tasks = MesosStateStore.getTasksByService(
        new Framework({
          id: "/spark",
          labels: {
            DCOS_COMMONS_API_VERSION: 1,
            DCOS_PACKAGE_FRAMEWORK_NAME: "spark"
          }
        })
      );
      expect(tasks).toEqual([
        {
          name: "spark",
          id: "spark.instance.1",
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

  describe("#getNodeFromID", () => {
    afterEach(() => {
      MesosStateStore.get = thisGet;
    });

    describe("when slave isn't falsey", () => {
      beforeEach(() => {
        thisGet = MesosStateStore.get;
        MesosStateStore.get = () => ({
          slaves: [
            {
              id: "amazon-thing",
              fakeProp: "fake"
            }
          ]
        });
      });

      it("returns the node with the correct ID", () => {
        const result = MesosStateStore.getNodeFromID("amazon-thing");
        expect(result.fakeProp).toEqual("fake");
      });

      it("returns undefined if node not found", () => {
        const result = MesosStateStore.getNodeFromID("nonExistentNode");
        expect(result).toBeUndefined();
      });
    });

    describe("when slave is falsey", () => {
      beforeEach(() => {
        thisGet = MesosStateStore.get;
        MesosStateStore.set({
          lastMesosState: {
            slaves: null
          }
        });
      });

      it("returns null with invalid state", () => {
        const result = MesosStateStore.getNodeFromID("nonExistentNode");
        expect(result).toBeNull();
      });
    });
  });

  describe("#getNodeFromHostname", () => {
    beforeEach(() => {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => ({
        slaves: [
          {
            id: "amazon-thing",
            fakeProp: "fake",
            hostname: "my-host"
          }
        ]
      });
    });

    afterEach(() => {
      MesosStateStore.get = thisGet;
    });

    it("returns the node with the correct hostname", () => {
      const result = MesosStateStore.getNodeFromHostname("my-host");
      expect(result.fakeProp).toEqual("fake");
    });

    it("returns undefined if node not found", () => {
      const result = MesosStateStore.getNodeFromHostname("nonExistentNode");
      expect(result).toEqual(undefined);
    });

    it("returns null with invalid state", () => {
      MesosStateStore.get = () => null;

      const result = MesosStateStore.getNodeFromHostname("nonExistentNode");
      expect(result).toEqual(undefined);
    });
  });

  describe("#getTasksFromNodeID", () => {
    it("doesn't fail with invalid state", () => {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => null;

      const result = MesosStateStore.getTasksFromNodeID("my-id");
      expect(result).toEqual([]);

      MesosStateStore.get = thisGet;
    });

    it("flags SDK tasks", () => {
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

      const result = MesosStateStore.getTasksFromNodeID("node-1");
      expect(result).toEqual([
        { id: 1, framework_id: "foo", sdkTask: true, slave_id: "node-1" },
        { id: 2, framework_id: "bar", slave_id: "node-1" }
      ]);

      MesosStateStore.get = thisGet;
      MesosStateUtil.getFrameworkToServicesMap = thisGetFrameworkToServicesMap;
    });
  });

  describe("#getRunningTasksFromVirtualNetworkName", () => {
    it("doesn't throw on invalid state", () => {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => null;

      const result = MesosStateStore.getRunningTasksFromVirtualNetworkName(
        "overlayName"
      );
      expect(result).toEqual([]);

      MesosStateStore.get = thisGet;
    });
  });

  describe("#getTaskFromTaskID", () => {
    beforeEach(() => {
      thisGet = MesosStateStore.get;
      const data = {
        frameworks: [{}],
        tasks: [{ id: 1 }, { id: 2 }]
      };

      MesosStateStore.get = () => data;
    });

    afterEach(() => {
      MesosStateStore.get = thisGet;
    });

    it("returns null from an unknown task ID", () => {
      const result = MesosStateStore.getTaskFromTaskID("not-a-task-id");
      expect(result).toBeNull();
    });

    it("returns an instance of Task", () => {
      const result = MesosStateStore.getTaskFromTaskID(1);
      expect(result instanceof Task).toBeTruthy();
    });

    it("finds a currently running task", () => {
      const result = MesosStateStore.getTaskFromTaskID(1);
      expect(result.get()).toEqual({ id: 1 });
    });

    it("finds a completed task", () => {
      const result = MesosStateStore.getTaskFromTaskID(2);
      expect(result.get()).toEqual({ id: 2 });
    });
  });

  describe("#getPodHistoricalInstances", () => {
    beforeEach(() => {
      thisGet = MesosStateStore.get;
      MesosStateStore.get = () => MESOS_STATE_WITH_HISTORY;
    });

    afterEach(() => {
      MesosStateStore.get = thisGet;
    });

    it("passes through to MesosStateUtil.getPodHistoricalInstances", () => {
      const pod = new Pod({ id: "/pod-p0" });
      const result = MesosStateStore.getPodHistoricalInstances(pod);
      const expected = MesosStateUtil.getPodHistoricalInstances(
        MESOS_STATE_WITH_HISTORY,
        pod
      );
      expect(result).toEqual(expected);
    });
  });
});
