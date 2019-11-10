import Transaction from "#SRC/js/structs/Transaction";

const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Labels = require("../Labels");

describe("Labels", () => {
  describe("#JSONReducer", () => {
    it("returns a key value object", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 0, "key"], "key"));
      batch = batch.add(new Transaction(["labels", 0, "value"], "value"));

      expect(batch.reduce(Labels.JSONReducer.bind({}), {})).toEqual({
        key: "value"
      });
    });
    it("keeps the last value if they have the same key", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 0, "key"], "key"));
      batch = batch.add(new Transaction(["labels", 0, "value"], "value"));
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 1, "key"], "key"));
      batch = batch.add(new Transaction(["labels", 1, "value"], "value2"));

      expect(batch.reduce(Labels.JSONReducer.bind({}), {})).toEqual({
        key: "value2"
      });
    });
    it("keeps remove the first item", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 0, "key"], "first"));
      batch = batch.add(new Transaction(["labels", 0, "value"], "value"));
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 1, "key"], "second"));
      batch = batch.add(new Transaction(["labels", 1, "value"], "value"));
      batch = batch.add(new Transaction(["labels"], 0, REMOVE_ITEM));

      expect(batch.reduce(Labels.JSONReducer.bind({}), {})).toEqual({
        second: "value"
      });
    });
  });
  describe("#JSONParser", () => {
    it("returns an empty array", () => {
      expect(Labels.JSONParser({})).toEqual([]);
    });
    it("returns an array of transactions", () => {
      expect(Labels.JSONParser({ labels: { key: "value" } })).toEqual([
        { type: ADD_ITEM, value: 0, path: ["labels"] },
        { type: SET, value: "key", path: ["labels", 0, "key"] },
        { type: SET, value: "value", path: ["labels", 0, "value"] }
      ]);
    });
  });
});
