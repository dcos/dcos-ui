const CompositeState = require("../../structs/CompositeState");
const Node = require("../../structs/Node");
const NodesList = require("../../structs/NodesList");
const Service = require("../../../../plugins/services/src/js/structs/Service");
const ServicesList = require("../../../../plugins/services/src/js/structs/ServicesList");
const ResourcesUtil = require("../ResourcesUtil");

function createFnWithNodeResources(used_resources) {
  const instance = new Node({ used_resources });

  return () => new NodesList({ items: [instance] });
}

function createFnWithServicesResources(used_resources) {
  const instance = new Service({ used_resources });

  return () => new ServicesList({ items: [instance] });
}

describe("ResourcesUtil", () => {
  beforeEach(() => {
    CompositeState.getNodesList = createFnWithNodeResources({
      cpus: 0,
      mem: 0,
      disk: 0,
      gpus: 0,
      bananas: 0
    });
  });

  describe("#getAvailableResources", () => {
    beforeEach(() => {
      CompositeState.getNodesList = () => new NodesList();
      CompositeState.getServicesList = () => new ServicesList();
    });

    it("returns an array", () => {
      const resources = ResourcesUtil.getAvailableResources();
      expect(Array.isArray(resources)).toBeTruthy();
    });

    it("returns a set of default resources", () => {
      const resources = ResourcesUtil.getAvailableResources();
      // Should at least have cpu, mem, disk
      expect(resources.length).toBeGreaterThan(2);
    });

    it("gets available resources from a node", () => {
      CompositeState.getNodesList = createFnWithNodeResources({
        foo: 0,
        bar: 0
      });

      const resources = ResourcesUtil.getAvailableResources();
      expect(resources).toEqual(["foo", "bar"]);
    });

    describe("without nodes", () => {
      beforeEach(() => {
        CompositeState.getNodesList = () => new NodesList();
      });

      it("gets available resources from a service", () => {
        CompositeState.getServiceList = createFnWithServicesResources({});

        const resources = ResourcesUtil.getAvailableResources();
        expect(resources).toEqual(["cpus", "mem", "gpus", "disk"]);
      });

      it("allows exclusion of resources", () => {
        const resources = ResourcesUtil.getAvailableResources(["gpus", "disk"]);
        expect(resources).toEqual(["cpus", "mem"]);
      });
    });

    describe("invalid or empty data", () => {
      it("returns an empty array when used resources is null", () => {
        CompositeState.getNodesList = () => ({
          getItems: () => [
            {
              getResources: () => null
            }
          ]
        });
        const resources = ResourcesUtil.getAvailableResources();
        expect(resources).toEqual([]);
      });

      it("returns an empty array when used resources is undefined", () => {
        CompositeState.getNodesList = () => ({
          getItems: () => [
            {
              getResources: () => undefined
            }
          ]
        });
        const resources = ResourcesUtil.getAvailableResources();
        expect(resources).toEqual([]);
      });

      it("returns an empty array when used resources is empty array", () => {
        CompositeState.getNodesList = () => ({
          getItems: () => [
            {
              getResources: () => []
            }
          ]
        });
        const resources = ResourcesUtil.getAvailableResources();
        expect(resources).toEqual([]);
      });
    });
  });

  describe("#getAdditionalResources", () => {
    it("returns resources that are unknown to the application", () => {
      const resources = ResourcesUtil.getAdditionalResources();
      expect(resources).toEqual(["bananas"]);
    });

    it("returns an empty array if there is no unknown resources", () => {
      CompositeState.getNodesList = createFnWithNodeResources({
        cpus: 0,
        mem: 0,
        disk: 0
      });

      const resources = ResourcesUtil.getAdditionalResources();
      expect(resources).toEqual([]);
    });
  });

  describe("#getResourceLabel", () => {
    it("returns label for known resource", () => {
      const label = ResourcesUtil.getResourceLabel("mem");
      expect(label).toEqual("Mem");
    });

    it("returns label for unknown resource", () => {
      const label = ResourcesUtil.getResourceLabel("foo");
      expect(label).toEqual("FOO");
    });

    it("returns label for unknown resource", () => {
      const label = ResourcesUtil.getResourceLabel("bananas");
      expect(label).toEqual("Bananas");
    });
  });

  describe("#getResourceLabels", () => {
    it("returns labels for all resources", () => {
      const labels = ResourcesUtil.getResourceLabels();
      expect(labels).toEqual({
        bananas: "Bananas",
        cpus: "CPU",
        disk: "Disk",
        gpus: "GPU",
        mem: "Mem"
      });
    });
  });

  describe("#getResourceColor", () => {
    it("returns color for known resource", () => {
      const color = ResourcesUtil.getResourceColor("disk");
      expect(color).toEqual(3);
    });

    it("returns color for unknown resource", () => {
      const color = ResourcesUtil.getResourceColor("bananas");
      expect(color).toEqual(1);
    });

    it("returns color from available colors", () => {
      const color = ResourcesUtil.getResourceColor("bananas", {
        availableColors: [9999, 1]
      });
      expect(color).toEqual(9999);
    });

    it("returns color for given index", () => {
      const color = ResourcesUtil.getResourceColor("bananas", {
        availableColors: [1, 1, 1, 1, 123456, 1],
        resourceList: [null, null, null, null, "bananas"]
      });
      expect(color).toEqual(123456);
    });
  });

  describe("#getResourceColors", () => {
    it("returns map of resource:color pairs", () => {
      const colors = ResourcesUtil.getResourceColors();
      expect(colors).toEqual({
        cpus: 0,
        mem: 6,
        disk: 3,
        gpus: 8,
        bananas: 1
      });
    });
  });
});
