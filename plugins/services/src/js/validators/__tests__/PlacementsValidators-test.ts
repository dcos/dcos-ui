import { ADD_ITEM, ERROR } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

import PlacementsValidators from "../PlacementsValidators";

import {
  PROP_MISSING_ONE,
  SYNTAX_ERROR
} from "../../constants/ServiceErrorTypes";

describe("PlacementsValidators", () => {
  describe("#validateConstraints", () => {
    it("returns no errors when there is no constraints", () => {
      expect(PlacementsValidators.validateConstraints([])).toEqual([]);
    });

    it("returns no errors when all constraints are correctly defined", () => {
      const constraints = [
        ["hostname", "UNIQUE"],
        ["CPUS", "MAX_PER", "123"]
      ];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([]);
    });

    it("returns an error when constraints is not an array", () => {
      const constraints = ":)";
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [],
          message: "constraints needs to be an array of 2 or 3 element arrays",
          type: "TYPE_NOT_ARRAY"
        }
      ]);
    });

    it("returns an error when a constraint is not an array", () => {
      const constraints = [":)"];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0],
          message: "Must be an array",
          type: "TYPE_NOT_ARRAY"
        }
      ]);
    });

    it("returns an error when a constraint definition is wrong", () => {
      const constraints = [["CPUS", "LIKE"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0, "value"],
          message: "You must specify a value for operator LIKE",
          type: PROP_MISSING_ONE,
          variables: { name: "value" }
        }
      ]);
    });

    it("returns an error when empty parameter is required", () => {
      const constraints = [["CPUS", "UNIQUE", "foo"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0, "value"],
          message: "Value must be empty for operator UNIQUE",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("returns an error when wrong characters are applied", () => {
      const constraints = [["CPUS", "GROUP_BY", "2foo"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0, "value"],
          message:
            "Must only contain characters between 0-9 for operator GROUP_BY",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("does not return an error for empty optional fields", () => {
      const constraints = [["hostname", "GROUP_BY"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([]);
    });

    it("returns an error when wrong characters are applied", () => {
      const constraints = [["CPUS", "MAX_PER", "foo"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0, "value"],
          message:
            "Must only contain characters between 0-9 for operator MAX_PER",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("accepts number strings for number-string fields", () => {
      const constraints = [["CPUS", "MAX_PER", "2"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([]);
    });
  });

  describe("#validateNoBatchError", () => {
    it("accepts a list of non error transactions", () => {
      const transactions = [
        new Transaction(["root"], "any", ADD_ITEM),
        new Transaction(["root"], "any", ADD_ITEM)
      ];

      expect(PlacementsValidators.validateNoBatchError(transactions)).toEqual(
        true
      );
    });

    it("does not accepts a list with any error transaction", () => {
      const transactions = [
        new Transaction(["root"], "any", ADD_ITEM),
        new Transaction(["root"], "any", ERROR)
      ];

      expect(PlacementsValidators.validateNoBatchError(transactions)).toEqual(
        false
      );
    });
  });
});
