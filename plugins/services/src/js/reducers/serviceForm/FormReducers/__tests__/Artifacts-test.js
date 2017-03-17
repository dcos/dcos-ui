const { SET, ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const Artifacts = require("../Artifacts");

describe("Artifacts", function() {
  describe("#FromReducer", function() {
    it("emits correct JSON", function() {
      const batch = new Batch([
        new Transaction(["fetch"], 0, ADD_ITEM),
        new Transaction(["fetch", 0, "uri"], "http://mesosphere.io", SET),
        new Transaction(["fetch"], 1, ADD_ITEM),
        new Transaction(["fetch", 1, "uri"], "http://mesosphere.com", SET)
      ]);

      expect(batch.reduce(Artifacts.FormReducer.bind({}), [])).toEqual([
        { uri: "http://mesosphere.io" },
        { uri: "http://mesosphere.com" }
      ]);
    });
  });
});
