const { ADD_ITEM, SET } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");

const Constraints = require("../Constraints");

describe("Constraints", function() {
  describe("#JSONReducer", function() {
    it("add unique constraint", function() {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "operator"], "UNIQUE", SET),
        new Transaction(["constraints", 0, "fieldName"], "HOSTNAME", SET)
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        {
          fieldName: "HOSTNAME",
          operator: "UNIQUE",
          value: null
        }
      ]);
    });

    it("changes operator value from UNIQUE to CLUSTER", function() {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "operator"], "UNIQUE", SET),
        new Transaction(["constraints", 0, "fieldName"], "LOCAL", SET),
        new Transaction(["constraints", 0, "operator"], "CLUSTER", SET)
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        {
          fieldName: "LOCAL",
          operator: "CLUSTER",
          value: null
        }
      ]);
    });
  });
});
