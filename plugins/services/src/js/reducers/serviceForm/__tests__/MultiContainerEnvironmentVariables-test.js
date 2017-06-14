const MultiContainerEnvironmentVariables = require("../MultiContainerEnvironmentVariables");
const {
  ADD_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Environment Variables", function() {
  describe("#JSONParser", function() {
    it("should return an empty array", function() {
      expect(MultiContainerEnvironmentVariables.JSONParser({})).toEqual([]);
    });

    it("should return an array of transactions", function() {
      expect(
        MultiContainerEnvironmentVariables.JSONParser({
          environment: { FOO: "value" }
        })
      ).toEqual([
        { type: ADD_ITEM, value: 0, path: ["env"] },
        { type: SET, value: "FOO", path: ["env", 0, "key"] },
        { type: SET, value: "value", path: ["env", 0, "value"] }
      ]);
    });

    it("should skip complex values", function() {
      expect(
        MultiContainerEnvironmentVariables.JSONParser({
          environment: { BAR: {} }
        })
      ).toEqual([]);
    });
  });
});
