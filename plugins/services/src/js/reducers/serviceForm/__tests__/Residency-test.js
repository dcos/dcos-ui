const Residency = require("../Residency");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Residency", function() {
  describe("#JSONReducer", function() {
    it("it should return undefined as default", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["id"], "foo"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual(undefined);
    });

    it("should return residency if residency ist set", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["residency"], { foo: "bar" }));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual({
        foo: "bar"
      });
    });

    it("should return undefined if a host volume is set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["localVolumes"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["localVolumes", 0, "type"], "HOST"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual(undefined);
    });

    it("should return residency if a persistent volume is set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["localVolumes"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["localVolumes", 0, "type"], "PERSISTENT")
      );

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual({
        relaunchEscalationTimeoutSeconds: 10,
        taskLostBehavior: "WAIT_FOREVER"
      });
    });

    it("should return undefined if a persistent volume is removed", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["localVolumes"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["localVolumes", 0, "type"], "PERSISTENT")
      );
      batch = batch.add(new Transaction(["localVolumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual(undefined);
    });

    it("should respect the parsed residency", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["residency"], { foo: "bar" }));
      batch = batch.add(new Transaction(["localVolumes"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["localVolumes", 0, "type"], "PERSISTENT")
      );

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual({
        foo: "bar"
      });
    });
  });

  describe("#JSONParser", function() {
    it("should return empty array if residency is not present", function() {
      expect(Residency.JSONParser({ id: "test" })).toEqual([]);
    });
    it("should return a transaction if residency is present", function() {
      expect(Residency.JSONParser({ residency: { foo: "bar" } })).toEqual({
        type: SET,
        path: ["residency"],
        value: { foo: "bar" }
      });
    });
  });
});
