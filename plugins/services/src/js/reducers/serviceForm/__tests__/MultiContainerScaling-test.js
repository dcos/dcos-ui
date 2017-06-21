const MultiContainerScaling = require("../MultiContainerScaling");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("MultiContainerScaling", function() {
  describe("#JSONReducer", function() {
    it("should not return anything with an empty back", function() {
      const batch = new Batch();

      expect(batch.reduce(MultiContainerScaling.JSONReducer.bind({}))).toEqual(
        null
      );
    });

    it("should return a fixed scaling block when instances defined", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["instances"], 1));

      expect(
        batch.reduce(MultiContainerScaling.JSONReducer.bind({}), {})
      ).toEqual({
        kind: "fixed",
        instances: 1
      });
    });

    it("should return different scaling kinds if defined", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["scaling.kind"], "wrong"));

      // NOTE: This is mainly future-proofing and not a feature
      expect(
        batch.reduce(MultiContainerScaling.JSONReducer.bind({}), {})
      ).toEqual({
        kind: "wrong",
        instances: 1
      });
    });
  });

  describe("#JSONParser", function() {
    it("should not populate transactions on empty config", function() {
      const expectedObject = [];

      expect(MultiContainerScaling.JSONParser({})).toEqual(expectedObject);
    });

    it("should properly populate instances and scaling.kind", function() {
      const expectedObject = [
        { type: SET, value: 2, path: ["instances"] },
        { type: SET, value: "random", path: ["scaling", "kind"] }
      ];

      expect(
        MultiContainerScaling.JSONParser({
          scaling: {
            instances: 2,
            kind: "random"
          }
        })
      ).toEqual(expectedObject);
    });
  });
});
