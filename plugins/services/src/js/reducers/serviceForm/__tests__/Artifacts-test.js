const Artifacts = require("../Artifacts");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  SET,
  ADD_ITEM
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Artifacts", function() {
  // #FormReducer behaves the same
  describe("#JSONReducer", function() {
    it("emits correct JSON", function() {
      const batch = new Batch([
        new Transaction(["fetch"], 0, ADD_ITEM),
        new Transaction(["fetch", 0, "uri"], "http://mesosphere.io", SET),
        new Transaction(["fetch"], 1, ADD_ITEM),
        new Transaction(["fetch", 1, "uri"], "http://mesosphere.com", SET)
      ]);

      expect(batch.reduce(Artifacts.JSONReducer.bind({}), {})).toEqual([
        { uri: "http://mesosphere.io" },
        { uri: "http://mesosphere.com" }
      ]);
    });
  });

  describe("#JSONParser", function() {
    it("parses JSON correctly", function() {
      expect(
        Artifacts.JSONParser({
          fetch: [
            { uri: "http://mesosphere.io" },
            { uri: "http://mesosphere.com" }
          ]
        })
      ).toEqual([
        { type: ADD_ITEM, path: ["fetch"], value: 0 },
        { type: SET, path: ["fetch", 0, "uri"], value: "http://mesosphere.io" },
        { type: ADD_ITEM, path: ["fetch"], value: 1 },
        { type: SET, path: ["fetch", 1, "uri"], value: "http://mesosphere.com" }
      ]);
    });
  });
});
