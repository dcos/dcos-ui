import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import * as EnvironmentVariables from "../EnvironmentVariables";

describe("Environment Variables", () => {
  describe("#JSONReducer", () => {
    it("returns a key value object", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "key"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));

      expect(
        batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {})
      ).toEqual({ key: "value" });
    });

    it("keeps the last value if they have the same key", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "key"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));
      batch = batch.add(new Transaction(["env"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 1, "key"], "key"));
      batch = batch.add(new Transaction(["env", 1, "value"], "value2"));

      expect(
        batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {})
      ).toEqual({ key: "value2" });
    });

    it("keeps remove the first item", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "first"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));
      batch = batch.add(new Transaction(["env"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 1, "key"], "second"));
      batch = batch.add(new Transaction(["env", 1, "value"], "value"));
      batch = batch.add(new Transaction(["env"], 0, REMOVE_ITEM));

      expect(
        batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {})
      ).toEqual({ second: "value" });
    });

    it("keeps environment variable with empty value", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "first"));

      expect(
        batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {})
      ).toEqual({ first: "" });
    });
  });

  describe("#JSONParser", () => {
    it("returns an empty array", () => {
      expect(EnvironmentVariables.JSONParser({})).toEqual([]);
    });

    it("returns an array of transactions", () => {
      expect(
        EnvironmentVariables.JSONParser({ env: { key: "value" } })
      ).toEqual([
        { type: ADD_ITEM, value: 0, path: ["env"] },
        { type: SET, value: "key", path: ["env", 0, "key"] },
        { type: SET, value: "value", path: ["env", 0, "value"] },
      ]);
    });

    it("returns an array of transactions for empty env var", () => {
      expect(EnvironmentVariables.JSONParser({ env: { key: null } })).toEqual([
        { type: ADD_ITEM, value: 0, path: ["env"] },
        { type: SET, value: "key", path: ["env", 0, "key"] },
      ]);
    });

    it("returns an array of transactions for empty string env var", () => {
      expect(EnvironmentVariables.JSONParser({ env: { key: "" } })).toEqual([
        { type: ADD_ITEM, value: 0, path: ["env"] },
        { type: SET, value: "key", path: ["env", 0, "key"] },
        { type: SET, value: "", path: ["env", 0, "value"] },
      ]);
    });

    it("skips non-string values", () => {
      expect(EnvironmentVariables.JSONParser({ env: { FOO: {} } })).toEqual([]);
    });
  });
});
