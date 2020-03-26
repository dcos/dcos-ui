import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { SET, ADD_ITEM } from "#SRC/js/constants/TransactionTypes";
import { FormReducer } from "../Artifacts";

describe("Artifacts", () => {
  describe("#FromReducer", () => {
    it("emits correct JSON", () => {
      const batch = new Batch([
        new Transaction(["fetch"], { uri: "http://example.io" }, ADD_ITEM),
        new Transaction(["fetch", 0, "uri"], "http://example.io", SET),
        new Transaction(["fetch"], { uri: "http://example.com" }, ADD_ITEM),
        new Transaction(["fetch", 1, "uri"], "http://example.com", SET),
      ]);

      expect(batch.reduce(FormReducer.bind({}), [])).toEqual([
        { uri: "http://example.io" },
        { uri: "http://example.com" },
      ]);
    });
  });
});
