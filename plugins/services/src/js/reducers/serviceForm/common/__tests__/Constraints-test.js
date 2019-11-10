import Transaction from "#SRC/js/structs/Transaction";

const { ADD_ITEM, SET, ERROR } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");

const Constraints = require("../Constraints");

describe("Constraints", () => {
  describe("#JSONReducer", () => {
    it("add unique constraint", () => {
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

    it("changes operator value from UNIQUE to CLUSTER", () => {
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

    it("adds error transaction if constraints are a list of objects", () => {
      expect(
        Constraints.JSONParser({ fieldName: "hostname", operator: "UNIQUE" })
      ).toEqual([new Transaction(["constraints"], "not-list", ERROR)]);
    });

    // Top level JSONParser whould already have converted
    // ["hostname","UNIQUE"] => {filedName: "hostname", operator: "UNIQUE"}
    it("adds error transaction when constraint is not passed as an array", () => {
      expect(Constraints.JSONParser([["hostname", "JOIN"]])).toEqual([
        new Transaction(
          ["constraints", 0, "value"],
          "value-not-converted-to-object",
          ERROR
        )
      ]);
    });

    it("adds error transaction when constraint is an invalid item", () => {
      expect(Constraints.JSONParser([1])).toEqual([
        new Transaction(["constraints", 0, "value"], "value-not-object", ERROR)
      ]);
    });

    it("adds error transaction when item flagged as error", () => {
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
