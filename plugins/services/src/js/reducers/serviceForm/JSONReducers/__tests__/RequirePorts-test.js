import Transaction from "#SRC/js/structs/Transaction";

const Batch = require("#SRC/js/structs/Batch");
const { SET } = require("#SRC/js/constants/TransactionTypes");
const RequirePorts = require("../RequirePorts");

describe("RequirePorts", () => {
  describe("#JSONReducer", () => {
    it("returns inverted value of portsAutoAssign", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["portsAutoAssign"], true, SET));

      expect(batch.reduce(RequirePorts.JSONReducer.bind({}))).toEqual(false);
    });
  });

  describe("#JSONParser", () => {
    it("returns true as default", () => {
      expect(RequirePorts.JSONParser({})).toEqual(
        new Transaction(["portsAutoAssign"], true)
      );
    });

    it("returns inverted value of requirePorts", () => {
      expect(
        RequirePorts.JSONParser({
          requirePorts: true
        })
      ).toEqual(new Transaction(["portsAutoAssign"], false));
    });
  });
});
