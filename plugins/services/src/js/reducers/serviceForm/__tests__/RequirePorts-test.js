const RequirePorts = require("../RequirePorts");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("RequirePorts", function() {
  describe("#JSONReducer", function() {
    it("should return inverted value of portsAutoAssign", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["portsAutoAssign"], true, SET));

      expect(batch.reduce(RequirePorts.JSONReducer.bind({}))).toEqual(false);
    });
  });

  describe("#JSONParser", function() {
    it("it should return true as default", function() {
      expect(RequirePorts.JSONParser({})).toEqual(
        new Transaction(["portsAutoAssign"], true)
      );
    });

    it("should return inverted value of requirePorts", function() {
      expect(
        RequirePorts.JSONParser({
          requirePorts: true
        })
      ).toEqual(new Transaction(["portsAutoAssign"], false));
    });
  });
});
