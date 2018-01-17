jest.mock("#SRC/js/structs/CompositeState");

const Node = require("#SRC/js/structs/Node");
const NodesList = require("#SRC/js/structs/NodesList");
const CompositeState = require("#SRC/js/structs/CompositeState");

const InstanceUtil = require("../InstanceUtil");
const MasterNodeLocal = require("./fixtures/MasterNodeLocal.json");
const MasterNodeOffsite = require("./fixtures/MasterNodeOffsite.json");
const SlaveNodes = require("./fixtures/SlaveNodes.json");
const NodeInstance = require("./fixtures/NodeInstance.json");

describe("InstanceUtil", function() {
  describe("#getRegionName", function() {
    beforeEach(function() {
      CompositeState.getNodesList = () => {
        return new NodesList({ items: SlaveNodes });
      };
      CompositeState.getMasterNode = () => {
        return new Node(MasterNodeLocal);
      };
    });
    it("returns N/A when no region name exists", function() {
      const task = Object.assign({}, NodeInstance, { agent: { id: "2" } });
      expect(InstanceUtil.getRegionName(task)).toEqual("N/A");
    });
    it("adds (Local) when no slave/ master in the same region", function() {
      expect(InstanceUtil.getRegionName(NodeInstance)).toEqual(
        "us-west-2 (Local)"
      );
    });
    it("returns region when slave/ master in different region", function() {
      CompositeState.getMasterNode = () => {
        return new Node(MasterNodeOffsite);
      };
      expect(InstanceUtil.getRegionName(NodeInstance)).toEqual("us-west-2");
    });
  });

  describe("#getZoneName", function() {
    beforeEach(function() {
      CompositeState.getNodesList = () => {
        return new NodesList({ items: SlaveNodes });
      };
    });
    it("returns N/A when no zone name exists", function() {
      const task = Object.assign({}, NodeInstance, { agent: { id: "2" } });
      expect(InstanceUtil.getZoneName(task)).toEqual("N/A");
    });
    it("returns zone when slave/ master in different zone", function() {
      CompositeState.getMasterNode = () => {
        return new Node(MasterNodeOffsite);
      };
      expect(InstanceUtil.getZoneName(NodeInstance)).toEqual("us-west-2a");
    });
  });
});
