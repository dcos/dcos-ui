import * as MultiContainerEnvironmentVariables from "../MultiContainerEnvironmentVariables";
import { SET } from "#SRC/js/constants/TransactionTypes";

describe("Environment Variables", () => {
  describe("#JSONParser", () => {
    it("returns an empty array", () => {
      expect(MultiContainerEnvironmentVariables.JSONParser({})).toEqual([]);
    });

    it("returns an array of transactions", () => {
      const environment = { FOO: "value" };
      expect(
        MultiContainerEnvironmentVariables.JSONParser({ environment })
      ).toEqual([{ type: SET, value: environment, path: ["env"] }]);
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
