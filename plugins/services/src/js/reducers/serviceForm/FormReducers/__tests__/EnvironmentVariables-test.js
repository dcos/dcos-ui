const { ADD_ITEM, REMOVE_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const EnvironmentVariables = require("../EnvironmentVariables");

describe("Environment Variables", function() {
  describe("#FormReducer", function() {
    it("should return a array containing key value objects", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "key"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));

      expect(
        batch.reduce(EnvironmentVariables.FormReducer.bind({}), [])
      ).toEqual([{ key: "key", value: "value" }]);
    });

    it("should return multiple items if they have the same key", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "key"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));
      batch = batch.add(new Transaction(["env"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 1, "key"], "key"));
      batch = batch.add(new Transaction(["env", 1, "value"], "value2"));

      expect(
        batch.reduce(EnvironmentVariables.FormReducer.bind({}), [])
      ).toEqual([
        { key: "key", value: "value" },
        { key: "key", value: "value2" }
      ]);
    });

    it("should remove the first item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "first"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));
      batch = batch.add(new Transaction(["env"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 1, "key"], "second"));
      batch = batch.add(new Transaction(["env", 1, "value"], "value"));
      batch = batch.add(new Transaction(["env"], 0, REMOVE_ITEM));

      expect(
        batch.reduce(EnvironmentVariables.FormReducer.bind({}), [])
      ).toEqual([{ key: "second", value: "value" }]);
    });
  });
});
