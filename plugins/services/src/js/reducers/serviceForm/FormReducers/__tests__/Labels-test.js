import Transaction from "#SRC/js/structs/Transaction";

const { ADD_ITEM, REMOVE_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Labels = require("../Labels");

describe("Labels", function() {
  describe("#FormReducer", function() {
    it("returns an array containing key value objects", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 0, "key"], "key"));
      batch = batch.add(new Transaction(["labels", 0, "value"], "value"));

      expect(batch.reduce(Labels.FormReducer.bind({}), [])).toEqual([
        { key: "key", value: "value" }
      ]);
    });
    it("returns multiple labels, even if they have the same key", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 0, "key"], "key"));
      batch = batch.add(new Transaction(["labels", 0, "value"], "value"));
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 1, "key"], "key"));
      batch = batch.add(new Transaction(["labels", 1, "value"], "value2"));

      expect(batch.reduce(Labels.FormReducer.bind({}), [])).toEqual([
        { key: "key", value: "value" },
        { key: "key", value: "value2" }
      ]);
    });
    it("keeps remove the first item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 0, "key"], "first"));
      batch = batch.add(new Transaction(["labels", 0, "value"], "value"));
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 1, "key"], "second"));
      batch = batch.add(new Transaction(["labels", 1, "value"], "value"));
      batch = batch.add(new Transaction(["labels"], 0, REMOVE_ITEM));

      expect(batch.reduce(Labels.FormReducer.bind({}), [])).toEqual([
        { key: "second", value: "value" }
      ]);
    });
  });
});
