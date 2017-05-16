const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const MultiContainerArtifacts = require("../MultiContainerArtifacts");

describe("MultiContainerArtifacts", function() {
  describe("#JSONReducer", function() {
    it("emits correct form data", function() {
      const batch = new Batch([
        new Transaction(["containers"], 0, ADD_ITEM),
        new Transaction(["containers", 0, "artifacts"], 0, ADD_ITEM),
        new Transaction(
          ["containers", 0, "artifacts", 0, "uri"],
          "http://mesosphere.io",
          SET
        ),
        new Transaction(["containers", 0, "artifacts"], 1, ADD_ITEM),
        new Transaction(
          ["containers", 0, "artifacts", 1, "uri"],
          "http://mesosphere.com",
          SET
        ),
        new Transaction(["containers", 0, "artifacts"], 2, ADD_ITEM),
        new Transaction(["containers", 0, "artifacts"], 3, ADD_ITEM)
      ]);

      expect(
        batch.reduce(MultiContainerArtifacts.JSONReducer.bind({}))
      ).toEqual([
        [
          { uri: "http://mesosphere.io" },
          { uri: "http://mesosphere.com" },
          { uri: null },
          { uri: null }
        ]
      ]);
    });

    it("removes the correct items", function() {
      const batch = new Batch([
        new Transaction(["containers"], 0, ADD_ITEM),
        new Transaction(["containers", 0, "artifacts"], 0, ADD_ITEM),
        new Transaction(
          ["containers", 0, "artifacts", 0, "uri"],
          "http://mesosphere.io",
          SET
        ),
        new Transaction(["containers", 0, "artifacts"], 1, ADD_ITEM),
        new Transaction(
          ["containers", 0, "artifacts", 1, "uri"],
          "http://mesosphere.com",
          SET
        ),
        new Transaction(["containers", 0, "artifacts"], 2, ADD_ITEM),
        new Transaction(["containers", 0, "artifacts"], 3, ADD_ITEM),
        new Transaction(["containers", 0, "artifacts"], 2, REMOVE_ITEM),
        new Transaction(["containers", 0, "artifacts"], 1, REMOVE_ITEM)
      ]);

      expect(
        batch.reduce(MultiContainerArtifacts.JSONReducer.bind({}))
      ).toEqual([[{ uri: "http://mesosphere.io" }, { uri: null }]]);
    });
  });
});
