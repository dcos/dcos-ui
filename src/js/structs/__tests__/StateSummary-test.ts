import Framework from "../../../../plugins/services/src/js/structs/Framework";
import NodesList from "../NodesList";
import ServicesList from "../../../../plugins/services/src/js/structs/ServicesList";
import StateSummary from "../StateSummary";

describe("StateSummary", () => {
  describe("#constructor", () => {
    it("constructs a state", () => {
      const instance = new StateSummary();
      expect(instance instanceof StateSummary).toEqual(true);
    });
  });

  describe("#getSnapshotDate", () => {
    it("creates a date when initialized", () => {
      const before = Date.now();
      const instance = new StateSummary();
      const after = Date.now();

      expect(instance.getSnapshotDate() >= before).toBeTruthy();
      expect(instance.getSnapshotDate() <= after).toBeTruthy();
    });

    it("allows us to set the date", () => {
      const date = Date.now();
      const instance = new StateSummary({ date });
      expect(instance.getSnapshotDate() === date).toBeTruthy();
    });
  });

  describe("#getActiveSlaves", () => {
    it("returns 0 active slaves by default", () => {
      const instance = new StateSummary();
      expect(instance.getActiveSlaves().length).toEqual(0);
    });

    it("correctly calculates active slaves", () => {
      const snapshot = {
        frameworks: [],
        slaves: [{ active: true }, { active: false }, { active: true }],
      };
      const instance = new StateSummary({ snapshot });
      expect(instance.getActiveSlaves().length).toEqual(2);
    });
  });

  describe("#getServiceList", () => {
    it("returns an instance of ServicesList", () => {
      const instance = new StateSummary();
      const services = instance.getServiceList();
      expect(services instanceof ServicesList).toBeTruthy();
    });

    it("ServicesList contains instances of Framework", () => {
      const frameworks = [{ a: 1 }];
      const instance = new StateSummary({ snapshot: { frameworks } });
      const services = instance.getServiceList().getItems();
      expect(services.length).toEqual(1);
      expect(services[0] instanceof Framework).toBeTruthy();
    });
  });

  describe("#getNodesList", () => {
    it("returns an instance of NodesList", () => {
      const instance = new StateSummary();
      const nodes = instance.getNodesList();
      expect(nodes instanceof NodesList).toBeTruthy();
    });

    it("NodesList contains instances of Node", () => {
      const slaves = [{ a: 1 }];
      const instance = new StateSummary({ snapshot: { slaves } });
      const nodes = instance.getNodesList();
      expect(nodes.getItems().length).toEqual(1);
      expect(nodes instanceof NodesList).toBeTruthy();
    });
  });

  describe("#getSlaveTotalResources", () => {
    it("defaults to 0 available resources if there's nothing", () => {
      const instance = new StateSummary();
      const defaultSum = { cpus: 0, mem: 0, disk: 0, gpus: 0 };
      expect(instance.getSlaveTotalResources()).toEqual(defaultSum);
    });

    it("calculates total resources available in slaves", () => {
      const snapshot = {
        frameworks: [],
        slaves: [
          { resources: { cpus: 1, mem: 0, disk: 2, gpus: 0 } },
          { resources: { cpus: 1, mem: 0, disk: 2, gpus: 0 } },
          { resources: { cpus: 1, mem: 0, disk: 2, gpus: 0 } },
        ],
      };
      const aggregate = { cpus: 3, mem: 0, disk: 6, gpus: 0 };
      const instance = new StateSummary({ snapshot });
      expect(instance.getSlaveTotalResources()).toEqual(aggregate);
    });
  });

  describe("#getSlaveUsedResources", () => {
    it("defaults to 0 available resources if there's nothing", () => {
      const instance = new StateSummary();
      const defaultSum = { cpus: 0, mem: 0, disk: 0, gpus: 0 };
      expect(instance.getSlaveUsedResources()).toEqual(defaultSum);
    });

    it("calculates used resources in slaves", () => {
      const snapshot = {
        frameworks: [],
        slaves: [
          { used_resources: { cpus: 1, mem: 0, disk: 2, gpus: 0 } },
          { used_resources: { cpus: 1, mem: 0, disk: 2, gpus: 0 } },
          { used_resources: { cpus: 1, mem: 0, disk: 2, gpus: 0 } },
        ],
      };
      const aggregate = { cpus: 3, mem: 0, disk: 6, gpus: 0 };
      const instance = new StateSummary({ snapshot });
      expect(instance.getSlaveUsedResources()).toEqual(aggregate);
    });
  });
});
