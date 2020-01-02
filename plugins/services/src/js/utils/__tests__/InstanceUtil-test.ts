import Node from "#SRC/js/structs/Node";
import NodesList from "#SRC/js/structs/NodesList";
import CompositeState from "#SRC/js/structs/CompositeState";

import InstanceUtil from "../InstanceUtil";
import MasterNodeLocal from "./fixtures/MasterNodeLocal.json";
import MasterNodeOffsite from "./fixtures/MasterNodeOffsite.json";
import SlaveNodes from "./fixtures/SlaveNodes.json";
import NodeInstance from "./fixtures/NodeInstance.json";

jest.mock("#SRC/js/structs/CompositeState");

describe("InstanceUtil", () => {
  describe("#getRegionName", () => {
    beforeEach(() => {
      CompositeState.getNodesList = () => new NodesList({ items: SlaveNodes });
      CompositeState.getMasterNode = () => new Node(MasterNodeLocal);
    });
    it("returns N/A when null is provided", () => {
      expect(InstanceUtil.getRegionName(null)).toEqual("N/A");
    });
    it("returns N/A when no region name exists", () => {
      const task = {
        ...NodeInstance,
        agentId: "2"
      };
      expect(InstanceUtil.getRegionName(task)).toEqual("N/A");
    });
    it("adds (Local) when no slave/ master in the same region", () => {
      expect(InstanceUtil.getRegionName(NodeInstance)).toEqual(
        "us-west-2 (Local)"
      );
    });
    it("returns region when slave/ master in different region", () => {
      CompositeState.getMasterNode = () => new Node(MasterNodeOffsite);
      expect(InstanceUtil.getRegionName(NodeInstance)).toEqual("us-west-2");
    });
  });

  describe("#getZoneName", () => {
    beforeEach(() => {
      CompositeState.getNodesList = () => new NodesList({ items: SlaveNodes });
    });
    it("returns N/A when null is provided", () => {
      expect(InstanceUtil.getZoneName(null)).toEqual("N/A");
    });
    it("returns N/A when no zone name exists", () => {
      const task = {
        ...NodeInstance,
        agentId: "2"
      };
      expect(InstanceUtil.getZoneName(task)).toEqual("N/A");
    });
    it("returns zone when slave/ master in different zone", () => {
      CompositeState.getMasterNode = () => new Node(MasterNodeOffsite);
      expect(InstanceUtil.getZoneName(NodeInstance)).toEqual("us-west-2a");
    });
  });
});
