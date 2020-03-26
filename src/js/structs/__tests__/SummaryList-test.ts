import SummaryList from "../SummaryList";
import StateSummary from "../StateSummary";

let thisNow, thisService1, thisService2, thisService3, thisService4, thisList;

describe("SummaryList", () => {
  describe("#add", () => {
    it("shifts elements off the list when max length is set", () => {
      const list = new SummaryList({ items: [0], maxLength: 2 });
      list.add(1);
      list.add(2);
      expect(list.getItems()).toEqual([1, 2]);
    });
  });

  describe("#addSnapshot", () => {
    it("adds new item to list", () => {
      const list = new SummaryList();
      expect(list.getItems().length).toEqual(0);
      list.addSnapshot({}, Date.now());
      expect(list.getItems().length).toEqual(1);
    });

    it("creates an instance of StateSummary out of an object", () => {
      const list = new SummaryList();
      list.addSnapshot({}, Date.now());
      const instance = list.last();
      expect(instance instanceof StateSummary).toEqual(true);
    });
  });

  describe("#getActiveNodesByState", () => {
    it("returns a list of state objects with slave count", () => {
      const now = Date.now();
      const list = new SummaryList();
      list.addSnapshot({ slaves: [{ active: true }, { active: false }] }, now);
      list.addSnapshot(
        { slaves: [{ active: true }, { active: true }] },
        now + 1
      );

      const expectedList = [
        { date: now, slavesCount: 1 },
        { date: now + 1, slavesCount: 2 },
      ];

      expect(list.getActiveNodesByState()).toEqual(expectedList);
    });
  });

  describe("#lastSuccessful", () => {
    beforeEach(() => {
      thisNow = Date.now();
      thisService1 = { name: "service 1" };
      thisService2 = { name: "service 2" };
      thisService3 = { name: "service 3" };
      thisService4 = { name: "service 4" };
    });

    it("returns the last successful snapshot", () => {
      const states = new SummaryList();
      states.addSnapshot({ frameworks: [thisService1, thisService2] }, thisNow);
      states.addSnapshot(
        { frameworks: [thisService3, thisService4] },
        thisNow + 1
      );

      const expectedState = {
        snapshot: {
          frameworks: [{ name: "service 3" }, { name: "service 4" }],
          slaves: [],
        },
        metadata: {
          date: thisNow + 1,
          successfulSnapshot: true,
          slaveUsedResources: { cpus: 0, mem: 0, disk: 0, gpus: 0 },
          slaveTotalResources: { cpus: 0, mem: 0, disk: 0, gpus: 0 },
        },
      };

      expect(states.lastSuccessful()).toEqual(expectedState);
    });

    it("gets last successful state if latest is unsuccessful", () => {
      const states = new SummaryList();
      states.addSnapshot({ frameworks: [thisService1, thisService2] }, thisNow);
      states.add(new StateSummary({ successful: false, date: thisNow + 1 }));

      const expectedState = {
        snapshot: {
          frameworks: [{ name: "service 1" }, { name: "service 2" }],
          slaves: [],
        },
        metadata: {
          date: thisNow,
          successfulSnapshot: true,
          slaveUsedResources: { cpus: 0, mem: 0, disk: 0, gpus: 0 },
          slaveTotalResources: { cpus: 0, mem: 0, disk: 0, gpus: 0 },
        },
      };

      expect(states.lastSuccessful()).toEqual(expectedState);
    });

    it("returns empty state if no successful snapshot found", () => {
      const states = new SummaryList();
      states.add(new StateSummary({ successful: false, date: thisNow }));
      states.add(new StateSummary({ successful: false, date: thisNow + 1 }));

      expect(states.lastSuccessful().isSnapshotSuccessful()).toEqual(false);
    });
  });

  describe("#getResourceStatesForNodeIDs", () => {
    beforeEach(() => {
      thisNow = Date.now();
      thisList = new SummaryList();
      thisList.addSnapshot(
        {
          slaves: [
            {
              id: 1,
              resources: { cpus: 5, mem: 5, disk: 5, gpus: 6 },
              used_resources: { cpus: 1, mem: 3, disk: 1, gpus: 2 },
            },
            {
              id: 2,
              resources: { cpus: 5, mem: 5, disk: 5, gpus: 6 },
              used_resources: { cpus: 1, mem: 3, disk: 1, gpus: 2 },
            },
          ],
        },
        thisNow
      );
    });

    it("returns empty resource lists", () => {
      const list = new SummaryList();
      const resources = list.getResourceStatesForNodeIDs();
      expect(resources).toEqual({ cpus: [], mem: [], disk: [], gpus: [] });
    });

    it("doesn't filter by ids", () => {
      const resources = thisList.getResourceStatesForNodeIDs();
      const expectedResult = {
        cpus: [{ date: thisNow, percentage: 20, value: 2 }],
        mem: [{ date: thisNow, percentage: 60, value: 6 }],
        disk: [{ date: thisNow, percentage: 20, value: 2 }],
        gpus: [{ date: thisNow, percentage: 33, value: 4 }],
      };

      expect(resources).toEqual(expectedResult);
    });

    it("filters by id", () => {
      const resources = thisList.getResourceStatesForNodeIDs([1]);
      const expectedResult = {
        cpus: [{ date: thisNow, percentage: 20, value: 1 }],
        mem: [{ date: thisNow, percentage: 60, value: 3 }],
        disk: [{ date: thisNow, percentage: 20, value: 1 }],
        gpus: [{ date: thisNow, percentage: 33, value: 2 }],
      };

      expect(resources).toEqual(expectedResult);
    });

    it("filters by ids", () => {
      const resources = thisList.getResourceStatesForNodeIDs([1, 2]);
      const expectedResult = {
        cpus: [{ date: thisNow, percentage: 20, value: 2 }],
        mem: [{ date: thisNow, percentage: 60, value: 6 }],
        disk: [{ date: thisNow, percentage: 20, value: 2 }],
        gpus: [{ date: thisNow, percentage: 33, value: 4 }],
      };

      expect(resources).toEqual(expectedResult);
    });

    it("computes all states and filters", () => {
      thisList.addSnapshot(
        {
          slaves: [
            {
              id: 1,
              resources: { cpus: 10, mem: 10, disk: 10, gpus: 6 },
              used_resources: { cpus: 1, mem: 3, disk: 1, gpus: 2 },
            },
            {
              id: 2,
              resources: { cpus: 10, mem: 10, disk: 10, gpus: 6 },
              used_resources: { cpus: 1, mem: 3, disk: 1, gpus: 2 },
            },
          ],
        },
        thisNow + 1
      );

      const resources = thisList.getResourceStatesForNodeIDs([1]);
      const expectedResult = {
        cpus: [
          { date: thisNow, percentage: 20, value: 1 },
          { date: thisNow + 1, percentage: 10, value: 1 },
        ],
        mem: [
          { date: thisNow, percentage: 60, value: 3 },
          { date: thisNow + 1, percentage: 30, value: 3 },
        ],
        disk: [
          { date: thisNow, percentage: 20, value: 1 },
          { date: thisNow + 1, percentage: 10, value: 1 },
        ],
        gpus: [
          { date: thisNow, percentage: 33, value: 2 },
          { date: thisNow + 1, percentage: 33, value: 2 },
        ],
      };

      expect(resources).toEqual(expectedResult);
    });

    it("sets fields to null to indicate unsuccessful snapshot", () => {
      const list = new SummaryList();
      list.add(new StateSummary({ successful: false, date: thisNow }));
      const resources = list.getResourceStatesForNodeIDs();
      const expectedResult = {
        cpus: [{ date: thisNow, percentage: null, value: null }],
        mem: [{ date: thisNow, percentage: null, value: null }],
        disk: [{ date: thisNow, percentage: null, value: null }],
        gpus: [{ date: thisNow, percentage: null, value: null }],
      };

      expect(resources).toEqual(expectedResult);
    });
  });
});
