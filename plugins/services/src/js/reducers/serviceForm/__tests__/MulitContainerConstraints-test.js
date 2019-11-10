import Transaction from "#SRC/js/structs/Transaction";

const MultiContainerConstraints = require("../MultiContainerConstraints");
const Batch = require("#SRC/js/structs/Batch");
const { SET, ADD_ITEM, ERROR } = require("#SRC/js/constants/TransactionTypes");

describe("MultiContainerConstraints", () => {
  describe("#JSONReducer", () => {
    it("emits correct JSON", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET)
      ]);

      // Doesn't expect 'scheduling' in the beginning as this object is passed
      // to the 'scheduling' key on the appConfig
      expect(
        batch.reduce(MultiContainerConstraints.JSONReducer.bind({}), [])
      ).toEqual([{ fieldName: "hostname", operator: "JOIN", value: "param" }]);
    });

    it("skips optional value", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);

      // Doesn't expect 'scheduling' in the beginning as this object is passed
      // to the 'scheduling' key on the appConfig
      expect(
        batch.reduce(MultiContainerConstraints.JSONReducer.bind({}), [])
      ).toEqual([{ fieldName: "hostname", operator: "JOIN" }]);
    });
  });

  describe("#JSONParser", () => {
    it("parses constraints correctly", () => {
      expect(
        MultiContainerConstraints.JSONParser({
          scheduling: {
            placement: {
              constraints: [
                { fieldName: "hostname", operator: "JOIN", value: "param" }
              ]
            }
          }
        })
      ).toEqual([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET)
      ]);
    });

    it("ignores null/undefined states", () => {
      expect(MultiContainerConstraints.JSONParser(null)).toEqual([]);
    });

    it("skips value if not set", () => {
      expect(
        MultiContainerConstraints.JSONParser({
          scheduling: {
            placement: {
              constraints: [{ fieldName: "hostname", operator: "JOIN" }]
            }
          }
        })
      ).toEqual([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);
    });

    it("adds error transaction if constraints are not a list", () => {
      expect(
        MultiContainerConstraints.JSONParser({
          scheduling: {
            placement: {
              constraints: { fieldName: "hostname", operator: "JOIN" }
            }
          }
        })
      ).toEqual([new Transaction(["constraints"], "not-list", ERROR)]);
    });

    it("adds error transaction when constraint item is not an object", () => {
      expect(
        MultiContainerConstraints.JSONParser({
          scheduling: {
            placement: {
              constraints: [["hostname", "UNIQUE"]]
            }
          }
        })
      ).toEqual([
        new Transaction(
          ["constraints", 0, "value"],
          "value-not-converted-to-object",
          ERROR
        )
      ]);
    });
  });

  describe("#FormReducer", () => {
    it("creates constraint objects for the form", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET),
        new Transaction(["constraints", 0, "value"], "param", SET)
      ]);

      expect(
        batch.reduce(MultiContainerConstraints.FormReducer.bind({}), [])
      ).toEqual([{ fieldName: "hostname", operator: "JOIN", value: "param" }]);
    });

    it("includes optional value even if not set", () => {
      const batch = new Batch([
        new Transaction(["constraints"], null, ADD_ITEM),
        new Transaction(["constraints", 0, "fieldName"], "hostname", SET),
        new Transaction(["constraints", 0, "operator"], "JOIN", SET)
      ]);

      expect(
        batch.reduce(MultiContainerConstraints.FormReducer.bind({}), [])
      ).toEqual([{ fieldName: "hostname", operator: "JOIN", value: null }]);
    });
  });
});
