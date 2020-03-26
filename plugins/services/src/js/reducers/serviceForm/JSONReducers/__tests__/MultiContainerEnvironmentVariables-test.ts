import * as MultiContainerEnvironmentVariables from "../MultiContainerEnvironmentVariables";
import { ADD_ITEM, SET } from "#SRC/js/constants/TransactionTypes";

describe("Environment Variables", () => {
  describe("#JSONParser", () => {
    it("returns an empty array", () => {
      expect(MultiContainerEnvironmentVariables.JSONParser({})).toEqual([]);
    });

    it("returns an array of transactions", () => {
      expect(
        MultiContainerEnvironmentVariables.JSONParser({
          environment: { FOO: "value" },
        })
      ).toEqual([
        { type: ADD_ITEM, value: 0, path: ["env"] },
        { type: SET, value: "FOO", path: ["env", 0, "key"] },
        { type: SET, value: "value", path: ["env", 0, "value"] },
      ]);
    });

    it("skips complex values", () => {
      expect(
        MultiContainerEnvironmentVariables.JSONParser({
          environment: { BAR: {} },
        })
      ).toEqual([]);
    });
  });
});
