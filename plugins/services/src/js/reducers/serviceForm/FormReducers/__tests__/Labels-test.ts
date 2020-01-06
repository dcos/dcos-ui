import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import * as Labels from "../Labels";

describe("Labels", () => {
  describe("#FormReducer", () => {
    it("returns an array containing key value objects", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["labels"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["labels", 0, "key"], "key"));
      batch = batch.add(new Transaction(["labels", 0, "value"], "value"));

      expect(batch.reduce(Labels.FormReducer.bind({}), [])).toEqual([
        { key: "key", value: "value" }
      ]);
    });
    it("returns multiple labels, even if they have the same key", () => {
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
    it("keeps remove the first item", () => {
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
