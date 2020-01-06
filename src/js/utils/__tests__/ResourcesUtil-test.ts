import CompositeState from "../../structs/CompositeState";
import Node from "../../structs/Node";
import NodesList from "../../structs/NodesList";

import * as ResourcesUtil from "../ResourcesUtil";

function createFnWithNodeResources(used_resources) {
  const instance = new Node({ used_resources });

  return () => new NodesList({ items: [instance] });
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
