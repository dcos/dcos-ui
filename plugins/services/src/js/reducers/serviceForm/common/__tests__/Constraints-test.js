const { ADD_ITEM, SET, ERROR } = require("#SRC/js/constants/TransactionTypes");
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

    it("adds error transaction if constraints are a list of objects", function() {
      expect(
        Constraints.JSONParser({ fieldName: "hostname", operator: "UNIQUE" })
      ).toEqual([new Transaction(["constraints"], "not-list", ERROR)]);
    });

    // Top level JSONParser whould already have converted
    // ["hostname","UNIQUE"] => {filedName: "hostname", operator: "UNIQUE"}
    it("adds error transaction when constraint is not passed as an array", function() {
      expect(Constraints.JSONParser([["hostname", "JOIN"]])).toEqual([
        new Transaction(
          ["constraints", 0, "value"],
          "value-not-converted-to-object",
          ERROR
        )
      ]);
    });

    it("adds error transaction when constraint is an invalid item", function() {
      expect(Constraints.JSONParser([1])).toEqual([
        new Transaction(["constraints", 0, "value"], "value-not-object", ERROR)
      ]);
    });

    it("adds error transaction when item flagged as error", function() {
      expect(Constraints.JSONParser([new Error("value-is-malformed")])).toEqual(
        [
          new Transaction(
            ["constraints", 0, "value"],
            "value-is-malformed",
            ERROR
          )
        ]
      );
    });
  });
});
