jest.dontMock("../../../../plugins/services/src/js/structs/Framework");
jest.dontMock("../../utils/MesosSummaryUtil");
jest.dontMock("../../utils/Util");

const Framework = require("../../../../plugins/services/src/js/structs/Framework");
const NodesList = require("../NodesList");
const ServicesList = require("../../../../plugins/services/src/js/structs/ServicesList");
const StateSummary = require("../StateSummary");

describe("StateSummary", function() {
  describe("#constructor", function() {
    it("constructs a state", function() {
      const instance = new StateSummary();
      expect(instance instanceof StateSummary).toEqual(true);
    });
  });

  describe("#getSnapshotDate", function() {
    it("creates a date when initialized", function() {
      const before = Date.now();
      const instance = new StateSummary();
      const after = Date.now();

      expect(instance.getSnapshotDate() >= before).toBeTruthy();
      expect(instance.getSnapshotDate() <= after).toBeTruthy();
    });

    it("allows us to set the date", function() {
      const date = Date.now();
      const instance = new StateSummary({ date });
      expect(instance.getSnapshotDate() === date).toBeTruthy();
    });
  });

  describe("#getActiveSlaves", function() {
    it("returns 0 active slaves by default", function() {
      const instance = new StateSummary();
      expect(instance.getActiveSlaves().length).toEqual(0);
    });

    it("correctly calculates active slaves", function() {
      const snapshot = {
        frameworks: [],
        slaves: [{ active: true }, { active: false }, { active: true }]
      };
      const instance = new StateSummary({ snapshot });
      expect(instance.getActiveSlaves().length).toEqual(2);
    });
  });

  describe("#getServiceList", function() {
    it("returns an instance of ServicesList", function() {
      const instance = new StateSummary();
      const services = instance.getServiceList();
      expect(services instanceof ServicesList).toBeTruthy();
    });

    it("ServicesList contains instances of Framework", function() {
      const frameworks = [{ a: 1 }];
      const instance = new StateSummary({ snapshot: { frameworks } });
      const services = instance.getServiceList().getItems();
      expect(services.length).toEqual(1);
      expect(services[0] instanceof Framework).toBeTruthy();
    });
  });

  describe("#getNodesList", function() {
    it("returns an instance of NodesList", function() {
      const instance = new StateSummary();
      const nodes = instance.getNodesList();
      expect(nodes instanceof NodesList).toBeTruthy();
    });

    it("NodesList contains instances of Node", function() {
      const slaves = [{ a: 1 }];
      const instance = new StateSummary({ snapshot: { slaves } });
      const nodes = instance.getNodesList();
      expect(nodes.getItems().length).toEqual(1);
      expect(nodes instanceof NodesList).toBeTruthy();
    });
  });

  describe("#getSlaveTotalResources", function() {
    it("defaults to 0 available resources if there's nothing", function() {
      const instance = new StateSummary();
      const defaultSum = { cpus: 0, mem: 0, disk: 0 };
      expect(instance.getSlaveTotalResources()).toEqual(defaultSum);
    });

    it("calculates total resources available in slaves", function() {
      const snapshot = {
        frameworks: [],
        slaves: [
          { resources: { cpus: 1, mem: 0, disk: 2 } },
          { resources: { cpus: 1, mem: 0, disk: 2 } },
          { resources: { cpus: 1, mem: 0, disk: 2 } }
        ]
      };
      const aggregate = { cpus: 3, mem: 0, disk: 6 };
      const instance = new StateSummary({ snapshot });
      expect(instance.getSlaveTotalResources()).toEqual(aggregate);
    });
  });

  describe("#getSlaveUsedResources", function() {
    it("defaults to 0 available resources if there's nothing", function() {
      const instance = new StateSummary();
      const defaultSum = { cpus: 0, mem: 0, disk: 0 };
      expect(instance.getSlaveUsedResources()).toEqual(defaultSum);
    });

    it("calculates used resources in slaves", function() {
      const snapshot = {
        frameworks: [],
        slaves: [
          { used_resources: { cpus: 1, mem: 0, disk: 2 } },
          { used_resources: { cpus: 1, mem: 0, disk: 2 } },
          { used_resources: { cpus: 1, mem: 0, disk: 2 } }
        ]
      };
      const aggregate = { cpus: 3, mem: 0, disk: 6 };
      const instance = new StateSummary({ snapshot });
      expect(instance.getSlaveUsedResources()).toEqual(aggregate);
    });
  });

  describe("#getServiceUsedResources", function() {
    it("defaults to 0 available resources if there's nothing", function() {
      const instance = new StateSummary();
      const defaultSum = { cpus: 0, mem: 0, disk: 0 };
      expect(instance.getServiceUsedResources()).toEqual(defaultSum);
    });

    it("calculates total resources available in slaves", function() {
      const snapshot = {
        frameworks: [
          { used_resources: { cpus: 1, mem: 0, disk: 2 } },
          { used_resources: { cpus: 1, mem: 0, disk: 2 } },
          { used_resources: { cpus: 1, mem: 0, disk: 2 } }
        ],
        slaves: []
      };
      const aggregate = { cpus: 3, mem: 0, disk: 6 };
      const instance = new StateSummary({ snapshot });
      expect(instance.getServiceUsedResources()).toEqual(aggregate);
    });
  });
});
