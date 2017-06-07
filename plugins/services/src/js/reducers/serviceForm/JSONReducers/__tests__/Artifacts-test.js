const { SET, ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const Artifacts = require("../Artifacts");

describe("Artifacts", function() {
  describe("#JSONParser", function() {
    it("parses JSON correctly", function() {
      expect(
        Artifacts.JSONParser({
          fetch: [{ uri: "http://example.io" }, { uri: "http://example.com" }]
        })
      ).toEqual([
        {
          type: ADD_ITEM,
          path: ["fetch"],
          value: { uri: "http://example.io" }
        },
        { type: SET, path: ["fetch", 0, "uri"], value: "http://example.io" },
        {
          type: ADD_ITEM,
          path: ["fetch"],
          value: { uri: "http://example.com" }
        },
        { type: SET, path: ["fetch", 1, "uri"], value: "http://example.com" }
      ]);
    });
  });

  describe("#JSONReducer", function() {
    it("emits correct JSON", function() {
      const batch = new Batch([
        new Transaction(["fetch"], { uri: "http://example.io" }, ADD_ITEM),
        new Transaction(["fetch", 0, "uri"], "http://example.io", SET),
        new Transaction(["fetch"], { uri: "http://example.com" }, ADD_ITEM),
        new Transaction(["fetch", 1, "uri"], "http://example.com", SET)
      ]);

      expect(batch.reduce(Artifacts.JSONReducer.bind({}), {})).toEqual([
        { uri: "http://example.io" },
        { uri: "http://example.com" }
      ]);
    });
  });
});
