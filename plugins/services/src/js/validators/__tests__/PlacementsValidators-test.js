import { ADD, ERROR } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

const PlacementsValidators = require("../PlacementsValidators");
const {
  PROP_MISSING_ONE,
  SYNTAX_ERROR
} = require("../../constants/ServiceErrorTypes");

describe("PlacementsValidators", function() {
  describe("#validateConstraints", function() {
    it("returns no errors when there is no constraints", function() {
      expect(PlacementsValidators.validateConstraints([])).toEqual([]);
    });

    it("returns no errors when all constraints are correctly defined", function() {
      const constraints = [["hostname", "UNIQUE"], ["CPUS", "MAX_PER", "123"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([]);
    });

    it("returns an error when constraints is not an array", function() {
      const constraints = ":)";
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [],
          message: "constraints needs to be an array of 2 or 3 element arrays",
          type: "TYPE_NOT_ARRAY"
        }
      ]);
    });

    it("returns an error when a constraint is not an array", function() {
      const constraints = [":)"];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0],
          message: "Must be an array",
          type: "TYPE_NOT_ARRAY"
        }
      ]);
    });

    it("returns an error when a constraint definition is wrong", function() {
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

    it("returns an error when empty parameter is required", function() {
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

    it("returns an error when wrong characters are applied", function() {
      const constraints = [["CPUS", "GROUP_BY", "2foo"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0, "value"],
          message: "Must only contain characters between 0-9 for operator GROUP_BY",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("doesn't return an error for empty optional fields", function() {
      const constraints = [["hostname", "GROUP_BY"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([]);
    });

    it("returns an error when wrong characters are applied", function() {
      const constraints = [["CPUS", "MAX_PER", "foo"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([
        {
          path: [0, "value"],
          message: "Must only contain characters between 0-9 for operator MAX_PER",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("accepts number strings for number-string fields", function() {
      const constraints = [["CPUS", "MAX_PER", "2"]];
      expect(PlacementsValidators.validateConstraints(constraints)).toEqual([]);
    });
  });

  describe("#validateNoBatchError", function() {
    it("accepts a list of non error transactions", function() {
      const transactions = [
        new Transaction(["root"], "any", ADD),
        new Transaction(["root"], "any", ADD)
      ];

      expect(PlacementsValidators.validateNoBatchError(transactions)).toEqual(
        true
      );
    });

    it("does not accepts a list with any error transaction", function() {
      const transactions = [
        new Transaction(["root"], "any", ADD),
        new Transaction(["root"], "any", ERROR)
      ];

      expect(PlacementsValidators.validateNoBatchError(transactions)).toEqual(
        false
      );
    });
  });
});
