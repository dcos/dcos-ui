const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const Residency = require("../Residency");

describe("Residency", function() {
  describe("#JSONReducer", function() {
    it("returns undefined as default", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["id"], "foo"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual(undefined);
    });

    it("returns residency if residency ist set", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["residency"], { foo: "bar" }));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual({
        foo: "bar"
      });
    });

    it("returns undefined residency if a persistent volume is set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "PERSISTENT"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toBeUndefined();
    });

    it("returns undefined if a persistent volume is removed", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "PERSISTENT"));
      batch = batch.add(new Transaction(["volumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toBeUndefined();
    });

    it("respects the parsed residency", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["residency"], { foo: "bar" }));
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "PERSISTENT"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual({
        foo: "bar"
      });
    });
  });

  describe("#JSONParser", function() {
    it("returns empty array if residency is not present", function() {
      expect(Residency.JSONParser({ id: "test" })).toEqual([]);
    });
    it("returns a transaction if residency is present", function() {
      expect(Residency.JSONParser({ residency: { foo: "bar" } })).toEqual({
        type: SET,
        path: ["residency"],
        value: { foo: "bar" }
      });
    });
  });
});
