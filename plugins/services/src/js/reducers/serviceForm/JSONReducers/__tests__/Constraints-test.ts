import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { SET, ADD_ITEM, ERROR } from "#SRC/js/constants/TransactionTypes";
import * as Constraints from "../Constraints";

describe("Constraints", () => {
  describe("#JSONReducer", () => {
    it("emits correct JSON", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET),
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        ["hostname", "JOIN", "param"],
      ]);
    });

    it("skips value required to be empty after operator was set", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "UNIQUE", SET),
        new Transaction(["constraints", 0, "value"], "foo", SET),
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        ["hostname", "UNIQUE"],
      ]);
    });

    it("skips value required to be empty before operator was set", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "value"], "foo", SET),
        new Transaction(["constraints", 0, "operator"], "UNIQUE", SET),
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), [])).toEqual([
        ["hostname", "UNIQUE"],
      ]);
    });
  });

  describe("#JSONParser", () => {
    it("parses constraints correctly", () => {
      expect(
        Constraints.JSONParser({
          constraints: [["hostname", "JOIN", "param"]],
        })
      ).toEqual([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET),
      ]);
    });

    it("ignores null/undefined states", () => {
      expect(Constraints.JSONParser(null)).toEqual([]);
    });

    it("skips value if not set", () => {
      expect(
        Constraints.JSONParser({
          constraints: [["hostname", "JOIN"]],
        })
      ).toEqual([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
      ]);
    });

    it("adds error transaction if constraints are not a list", () => {
      expect(
        Constraints.JSONParser({
          constraints: { fieldName: "hostname", operator: "JOIN" },
        })
      ).toEqual([new Transaction(["constraints"], "not-list", ERROR)]);
    });

    it("adds error transaction when constraint item is not a list", () => {
      expect(
        Constraints.JSONParser({
          constraints: [{ error: true }],
        })
      ).toEqual([
        new Transaction(
          ["constraints", 0, "value"],
          "value-is-malformed",
          ERROR
        ),
      ]);
    });
  });
});
