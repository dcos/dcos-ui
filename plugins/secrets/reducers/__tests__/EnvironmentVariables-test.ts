import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import EnvVarsReducer from "../EnvironmentVariables";
import { emptySingleContainerSecret } from "../Secrets";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

let thisBatch;

describe("Secrets", () => {
  describe("#JSONReducer", () => {
    beforeEach(() => {
      thisBatch = new Batch([
        new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM),
        new Transaction(["secrets", 0, "value"], "database_password", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0],
          { type: "envVar", value: "DB_PASS" },
          SET
        ),
        new Transaction(
          ["secrets", 0, "exposures", 1],
          { type: "envVar", value: "ROOT_PASS" },
          SET
        ),
      ]);
    });

    it("generates correct definition", () => {
      const definition = thisBatch.reduce(
        EnvVarsReducer.JSONReducer.bind({}),
        {}
      );

      expect(definition).toEqual({
        DB_PASS: {
          secret: "secret0",
        },
        ROOT_PASS: {
          secret: "secret0",
        },
      });
    });

    it("handles multiple secrets", () => {
      let batch = thisBatch.add(
        new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM)
      );
      batch = batch.add(
        new Transaction(["secrets", 1, "value"], "redis_pass", SET)
      );
      batch = batch.add(
        new Transaction(
          ["secrets", 1, "exposures", 0],
          { type: "envVar", value: "REDIS_PASS" },
          SET
        )
      );

      const definition = batch.reduce(EnvVarsReducer.JSONReducer.bind({}), {});

      expect(definition).toEqual({
        DB_PASS: { secret: "secret0" },
        ROOT_PASS: { secret: "secret0" },
        REDIS_PASS: { secret: "secret1" },
      });
    });

    it("handles custom keys", () => {
      let batch = thisBatch.add(
        new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM)
      );
      batch = batch.add(
        new Transaction(["secrets", 1, "key"], "redis-password", SET)
      );
      batch = batch.add(
        new Transaction(["secrets", 1, "value"], "redis_pass", SET)
      );
      batch = batch.add(
        new Transaction(
          ["secrets", 1, "exposures", 0],
          { type: "envVar", value: "REDIS_PASS" },
          SET
        )
      );

      const definition = batch.reduce(EnvVarsReducer.JSONReducer.bind({}), {});

      expect(definition).toEqual({
        DB_PASS: { secret: "secret0" },
        ROOT_PASS: { secret: "secret0" },
        REDIS_PASS: { secret: "redis-password" },
      });
    });

    it("removes secret element", () => {
      const batch = thisBatch.add(new Transaction(["secrets"], 0, REMOVE_ITEM));

      const definition = batch.reduce(EnvVarsReducer.JSONReducer.bind({}), {});

      expect(definition).toEqual({});
    });

    it("removes one of the environment vars element", () => {
      const batch = thisBatch.add(
        new Transaction(["secrets", 0, "exposures"], 0, REMOVE_ITEM)
      );

      const definition = batch.reduce(EnvVarsReducer.JSONReducer.bind({}), {});

      expect(definition).toEqual({
        ROOT_PASS: {
          secret: "secret0",
        },
      });
    });

    it("clears value when changing exposure type", () => {
      const batch = new Batch([
        new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM),
        new Transaction(["secrets", 0, "value"], "database_password", SET),
        new Transaction(
          ["secrets", 0, "exposures"],
          { type: "", value: "" },
          ADD_ITEM
        ),
        new Transaction(["secrets", 0, "exposures", 0, "type"], "file", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0, "value"],
          "secrets/test",
          SET
        ),
        new Transaction(["secrets", 0, "exposures", 0, "type"], "envVar", SET),
      ]);

      const definition = batch.reduce(EnvVarsReducer.JSONReducer.bind({}), {});

      expect(definition).toEqual({});
    });
  });
});
