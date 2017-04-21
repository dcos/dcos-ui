const CompositeState = require("../../structs/CompositeState");
const Node = require("../../structs/Node");
const NodesList = require("../../structs/NodesList");
const ResourcesUtil = require("../ResourcesUtil");

function createFnWithResources(used_resources) {
  const instance = new Node({ used_resources });

  return function() {
    return new NodesList({ items: [instance] });
  };
}

describe("ResourcesUtil", function() {
  beforeEach(function() {
    CompositeState.getNodesList = createFnWithResources({
      cpus: 0,
      mem: 0,
      disk: 0,
      gpu: 0,
      bananas: 0
    });
  });

  describe("#getAvailableResources", function() {
    beforeEach(function() {
      CompositeState.getNodesList = function() {
        return new NodesList();
      };
      CompositeState.getServicesList = function() {
        return [];
      };
    });

    it("returns an array", function() {
      const resources = ResourcesUtil.getAvailableResources();
      expect(Array.isArray(resources)).toBeTruthy();
    });

    it("returns a set of default resources", function() {
      const resources = ResourcesUtil.getAvailableResources();
      // Should at least have cpu, mem, disk
      expect(resources.length).toBeGreaterThan(2);
    });

    it("gets available resources from a node", function() {
      CompositeState.getNodesList = createFnWithResources({ foo: 0, bar: 0 });

      const resources = ResourcesUtil.getAvailableResources();
      expect(resources).toEqual(["foo", "bar"]);
    });

    it("gets available resources from a service", function() {
      CompositeState.getServiceList = createFnWithResources({ baz: 0, qux: 0 });

      const resources = ResourcesUtil.getAvailableResources();
      expect(resources).toEqual(["baz", "qux"]);
    });

    it("allows exclusion of resources", function() {
      CompositeState.getServiceList = createFnWithResources({
        foo: 0,
        bar: 0,
        baz: 0,
        qux: 0
      });

      const resources = ResourcesUtil.getAvailableResources(["bar", "qux"]);
      expect(resources).toEqual(["foo", "baz"]);
    });
  });

  describe("#getAdditionalResources", function() {
    beforeEach(function() {
      CompositeState.getNodesList = createFnWithResources({
        cpus: 0,
        mem: 0,
        disk: 0,
        gpu: 0,
        bananas: 0
      });
    });

    it("returns resources that are unknown to the application", function() {
      const resources = ResourcesUtil.getAdditionalResources();
      expect(resources).toEqual(["bananas", "gpu"]);
    });

    it("returns an empty array if there is no unknown resources", function() {
      CompositeState.getNodesList = createFnWithResources({
        cpus: 0,
        mem: 0,
        disk: 0
      });

      const resources = ResourcesUtil.getAdditionalResources();
      expect(resources).toEqual([]);
    });
  });

  describe("#getResourceLabel", function() {
    it("returns label for known resource", function() {
      const label = ResourcesUtil.getResourceLabel("mem");
      expect(label).toEqual("Memory");
    });

    it("returns label for unknown resource", function() {
      const label = ResourcesUtil.getResourceLabel("foo");
      expect(label).toEqual("FOO");
    });

    it("returns label for unknown resource", function() {
      const label = ResourcesUtil.getResourceLabel("bananas");
      expect(label).toEqual("Bananas");
    });
  });

  describe("#getResourceLabels", function() {
    it("returns labels for all resources", function() {
      const labels = ResourcesUtil.getResourceLabels();
      expect(labels).toEqual({
        bananas: "Bananas",
        cpus: "CPU",
        disk: "Disk",
        gpu: "GPU",
        mem: "Memory"
      });
    });
  });

  describe("#getResourceColor", function() {
    it("returns color for known resource", function() {
      const color = ResourcesUtil.getResourceColor("disk");
      expect(color).toEqual(3);
    });

    it("returns color for unknown resource", function() {
      const color = ResourcesUtil.getResourceColor("bananas");
      expect(color).toEqual(1);
    });

    it("returns color from available colors", function() {
      const color = ResourcesUtil.getResourceColor("bananas", {
        availableColors: [9999, 1]
      });
      expect(color).toEqual(9999);
    });

    it("returns color for given index", function() {
      const color = ResourcesUtil.getResourceColor("bananas", {
        availableColors: [1, 1, 1, 1, 123456, 1],
        resourceList: [null, null, null, null, "bananas"]
      });
      expect(color).toEqual(123456);
    });
  });

  describe("#getResourceColors", function() {
    it("returns map of resource:color pairs", function() {
      const colors = ResourcesUtil.getResourceColors();
      expect(colors).toEqual({
        cpus: 0,
        mem: 6,
        disk: 3,
        gpu: 2,
        bananas: 1
      });
    });
  });
});
