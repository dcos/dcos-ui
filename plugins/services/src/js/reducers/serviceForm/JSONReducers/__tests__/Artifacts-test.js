import Transaction from "#SRC/js/structs/Transaction";

const { SET, ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Artifacts = require("../Artifacts");

describe("Artifacts", () => {
  describe("#JSONParser", () => {
    it("parses JSON correctly", () => {
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

  describe("#JSONReducer", () => {
    it("emits correct JSON", () => {
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
