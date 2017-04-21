const ServicePlanBlock = require("../ServicePlanBlock");
const ServicePlanStatusTypes = require("../../constants/ServicePlanStatusTypes");

describe("ServicePlanBlock", function() {
  describe("#getID", function() {
    it("should return id", function() {
      const Block = new ServicePlanBlock({ id: "block-1" });

      expect(Block.getID()).toEqual("block-1");
    });
  });

  describe("#getName", function() {
    it("should return name", function() {
      const Block = new ServicePlanBlock({ name: "block-2" });

      expect(Block.getName()).toEqual("block-2");
    });
  });

  describe("#isComplete", function() {
    it("should return false", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.IN_PROGRESS
      });

      expect(Block.isComplete()).toEqual(false);
    });

    it("should return true", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Block.isComplete()).toEqual(true);
    });
  });

  describe("#isInProgress", function() {
    it("should return false", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Block.isInProgress()).toEqual(false);
    });

    it("should return true", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.IN_PROGRESS
      });

      expect(Block.isInProgress()).toEqual(true);
    });
  });

  describe("#isPending", function() {
    it("should return false", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Block.isPending()).toEqual(false);
    });

    it("should return true", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.PENDING
      });

      expect(Block.isPending()).toEqual(true);
    });
  });

  describe("#isWaiting", function() {
    it("should return false", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Block.isWaiting()).toEqual(false);
    });

    it("should return true", function() {
      const Block = new ServicePlanBlock({
        status: ServicePlanStatusTypes.WAITING
      });

      expect(Block.isWaiting()).toEqual(true);
    });
  });
});
