import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import JSONSingleContainerReducers from "../JSONSingleContainerReducers";

import { SET } from "#SRC/js/constants/TransactionTypes";
import { combineReducers } from "#SRC/js/utils/ReducerUtil";

describe("JSONSingleContainerReducers", () => {
  describe("#cmd", () => {
    it("returns a cmd at the root level with a nested path", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["cmd"], "sleep 999", SET));

      expect(
        batch.reduce(
          combineReducers({ cmd: JSONSingleContainerReducers.cmd }).bind({}),
          {}
        )
      ).toEqual({ cmd: "sleep 999" });
    });
  });
});
