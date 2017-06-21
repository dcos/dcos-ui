const Constraints = require("../Constraints");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  SET,
  ADD_ITEM
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Constraints", function() {
  describe("#JSONReducer", function() {
    it("emits correct JSON", function() {
      const batch = new Batch([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET)
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        ["hostname", "JOIN", "param"]
      ]);
    });

    it("skips value required to be empty after operator was set", function() {
      const batch = new Batch([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "UNIQUE", SET),
        new Transaction(["constraints", 0, "value"], "foo", SET)
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        ["hostname", "UNIQUE"]
      ]);
    });

    it("skips value required to be empty before operator was set", function() {
      const batch = new Batch([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "value"], "foo", SET),
        new Transaction(["constraints", 0, "operator"], "UNIQUE", SET)
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        ["hostname", "UNIQUE"]
      ]);
    });
  });

  describe("#JSONParser", function() {
    it("parses constraints correctly", function() {
      expect(
        Constraints.JSONParser({
          constraints: [["hostname", "JOIN", "param"]]
        })
      ).toEqual([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET)
      ]);
    });

    it("ignores non-array constraints", function() {
      expect(
        Constraints.JSONParser({
          constraints: {
            fieldName: "hostname",
            operator: "JOIN",
            value: "param"
          }
        })
      ).toEqual([]);
    });

    it("ignores non-array constraint items", function() {
      expect(
        Constraints.JSONParser({
          constraints: [
            { fieldName: "hostname", operator: "JOIN", value: "param" }
          ]
        })
      ).toEqual([]);
    });

    it("ignores null/undefined states", function() {
      expect(Constraints.JSONParser(null)).toEqual([]);
    });

    it("skips value if not set", function() {
      expect(
        Constraints.JSONParser({
          constraints: [["hostname", "JOIN"]]
        })
      ).toEqual([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);
    });
  });

  describe("#FormReducer", function() {
    it("creates constraint objects for the form", function() {
      const batch = new Batch([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), [])).toEqual([
        { fieldName: "hostname", operator: "JOIN", value: "param" }
      ]);
    });

    it("includes optional value even if not set", function() {
      const batch = new Batch([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), [])).toEqual([
        { fieldName: "hostname", operator: "JOIN", value: null }
      ]);
    });

    it("doesn't process non-array states", function() {
      const batch = new Batch([
        new Transaction(["constraints"], 0, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);

      expect(batch.reduce(Constraints.FormReducer.bind({}), {})).toEqual({});
    });
  });
});
