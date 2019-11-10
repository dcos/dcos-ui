import Transaction from "#SRC/js/structs/Transaction";

const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const MultiContainerArtifacts = require("../MultiContainerArtifacts");

describe("MultiContainerArtifacts", () => {
  describe("#JSONReducer", () => {
    it("emits correct form data", () => {
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

    it("removes the correct items", () => {
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
