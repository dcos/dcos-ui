const MultiContainerConstraints = require("../MultiContainerConstraints");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const { SET, ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");

describe("MultiContainerConstraints", function() {
  describe("#JSONReducer", function() {
    it("emits correct JSON", function() {
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

    it("skips optional value", function() {
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

  describe("#JSONParser", function() {
    it("parses constraints correctly", function() {
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

    it("ignores non-array constraints", function() {
      expect(
        MultiContainerConstraints.JSONParser({
          scheduling: {
            placement: {
              constraints: {}
            }
          }
        })
      ).toEqual([]);
    });

    it("ignores null/undefined states", function() {
      expect(MultiContainerConstraints.JSONParser(null)).toEqual([]);
    });

    it("skips value if not set", function() {
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
  });

  describe("#FormReducer", function() {
    it("creates constraint objects for the form", function() {
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

    it("includes optional value even if not set", function() {
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
