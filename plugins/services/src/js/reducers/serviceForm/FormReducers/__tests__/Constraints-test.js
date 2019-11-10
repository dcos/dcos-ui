import Transaction from "#SRC/js/structs/Transaction";

const { SET, ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Constraints = require("../Constraints");

describe("Constraints", () => {
  describe("#FormReducer", () => {
    it("creates constraint objects for the form", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), [])).toEqual([
        { fieldName: "hostname", operator: "JOIN", value: "param" }
      ]);
    });

    it("includes optional value even if not set", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), [])).toEqual([
        { fieldName: "hostname", operator: "JOIN", value: null }
      ]);
    });

    it("doesn't process non-array states", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), {})).toEqual({});
    });

    it("add unique constraint", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "operator"], "UNIQUE", SET),
        new Transaction(["constraints", 0, "fieldName"], "HOSTNAME", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), [])).toEqual([
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

      expect(batch.reduce(Constraints.FormReducer.bind({}), [])).toEqual([
        {
          fieldName: "LOCAL",
          operator: "CLUSTER",
          value: null
        }
      ]);
    });

    it("does not crash when type is Set, name is type and newState[index] is undefined", () => {
      const batch = new Batch([
        new Transaction(["constraints", 0, "type"], "hostname", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), [])).toEqual([]);
    });
  });
});
