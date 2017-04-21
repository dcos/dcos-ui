const JSONSingleContainerReducers = require("../JSONSingleContainerReducers");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const { SET } = require("#SRC/js/constants/TransactionTypes");
const { combineReducers } = require("#SRC/js/utils/ReducerUtil");

describe("JSONSingleContainerReducers", function() {
  describe("#cmd", function() {
    it("should return a cmd at the root level with a nested path", function() {
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
