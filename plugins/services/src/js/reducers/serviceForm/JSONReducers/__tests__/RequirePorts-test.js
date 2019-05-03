import Transaction from "#SRC/js/structs/Transaction";

const Batch = require("#SRC/js/structs/Batch");
const { SET } = require("#SRC/js/constants/TransactionTypes");
const RequirePorts = require("../RequirePorts");

describe("RequirePorts", function() {
  describe("#JSONReducer", function() {
    it("returns inverted value of portsAutoAssign", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["portsAutoAssign"], true, SET));

      expect(batch.reduce(RequirePorts.JSONReducer.bind({}))).toEqual(false);
    });
  });

  describe("#JSONParser", function() {
    it("returns true as default", function() {
      expect(RequirePorts.JSONParser({})).toEqual(
        new Transaction(["portsAutoAssign"], true)
      );
    });

    it("returns inverted value of requirePorts", function() {
      expect(
        RequirePorts.JSONParser({
          requirePorts: true
        })
      ).toEqual(new Transaction(["portsAutoAssign"], false));
    });
  });
});
