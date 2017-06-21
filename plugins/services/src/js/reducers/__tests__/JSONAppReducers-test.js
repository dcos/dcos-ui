const JSONReducers = require("../JSONAppReducers");
const Batch = require("../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../src/js/structs/Transaction");
const { SET } = require("../../../../../../src/js/constants/TransactionTypes");
const {
  combineReducers
} = require("../../../../../../src/js/utils/ReducerUtil");

describe("JSONReducers", function() {
  describe("#cmd", function() {
    it("should return a cmd at the root level with a nested path", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["cmd"], "sleep 999", SET));

      expect(
        batch.reduce(combineReducers({ cmd: JSONReducers.cmd }).bind({}), {})
      ).toEqual({ cmd: "sleep 999" });
    });
  });
});
