import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import {
  JSONSingleContainerReducer,
  JSONMultiContainerReducer,
} from "../Volumes";
import {
  emptySingleContainerSecret,
  emptyMultiContainerSecret,
} from "../Secrets";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

let thisBatch;

describe("Secrets Volumes", () => {
  describe("#JSONSingleContainerReducer", () => {
    beforeEach(() => {
      thisBatch = new Batch([
        new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM),
        new Transaction(["secrets", 0, "value"], "service_account", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0],
          { type: "file", value: "secrets/sa" },
          SET
        ),
      ]);
    });

    it("returns an empty array if no secrets are set", () => {
      const batch = new Batch();

      expect(batch.reduce(JSONSingleContainerReducer.bind({}), {})).toEqual([]);
    });

    it("generates correct definition", () => {
      const definition = thisBatch.reduce(
        JSONSingleContainerReducer.bind({}),
        {}
      );

      expect(definition).toEqual([
        {
          containerPath: "secrets/sa",
          secret: "secret0",
        },
      ]);
    });

    it("can handle multiple files", () => {
      thisBatch = thisBatch.add(
        new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM)
      );
      thisBatch = thisBatch.add(
        new Transaction(["secrets", 1, "value"], "dev/service_account", SET)
      );
      thisBatch = thisBatch.add(
        new Transaction(
          ["secrets", 1, "exposures", 0],
          { type: "file", value: "secrets/dev-sa.json" },
          SET
        )
      );
      const definition = thisBatch.reduce(
        JSONSingleContainerReducer.bind({}),
        {}
      );

      expect(definition).toEqual([
        {
          containerPath: "secrets/sa",
          secret: "secret0",
        },
        {
          containerPath: "secrets/dev-sa.json",
          secret: "secret1",
        },
      ]);
    });

    it("can remove volumes", () => {
      const batch = thisBatch.add(
        new Transaction(["secrets", 0, "exposures"], 0, REMOVE_ITEM)
      );
      const definition = batch.reduce(JSONSingleContainerReducer.bind({}), []);

      expect(definition).toEqual([]);
    });
  });
  describe("#JSONMultiContainerReducer", () => {
    beforeEach(() => {
      thisBatch = new Batch([
        new Transaction(["secrets"], emptyMultiContainerSecret(), ADD_ITEM),
        new Transaction(["secrets", 0, "value"], "service_account", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0],
          {
            type: "",
            value: "",
          },
          SET
        ),
        new Transaction(["secrets", 0, "exposures", 0, "type"], "file", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0, "mounts", 0],
          "secrets/sa",
          SET
        ),
      ]);
    });

    it("return an empty array if no secrets are set", () => {
      const batch = new Batch();

      expect(batch.reduce(JSONMultiContainerReducer.bind({}), [])).toEqual([]);
    });

    it("generates correct definition", () => {
      const definition = thisBatch.reduce(
        JSONMultiContainerReducer.bind({}),
        []
      );

      expect(definition).toEqual([
        {
          name: "secret0volume0",
          secret: "secret0",
        },
      ]);
    });

    it("returns existing volumes in state", () => {
      const definition = thisBatch.reduce(JSONMultiContainerReducer.bind({}), [
        {
          name: "existing",
          persistent: {
            size: 100,
          },
        },
      ]);

      expect(definition).toEqual([
        {
          name: "existing",
          persistent: {
            size: 100,
          },
        },
        {
          name: "secret0volume0",
          secret: "secret0",
        },
      ]);
    });

    it("return an empty array if no mount paths are set", () => {
      const batch = new Batch([
        new Transaction(["secrets"], emptyMultiContainerSecret(), ADD_ITEM),
        new Transaction(["secrets", 0, "value"], "service_account", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0],
          {
            type: "file",
            value: null,
            mounts: [""],
          },
          SET
        ),
      ]);

      expect(batch.reduce(JSONMultiContainerReducer.bind({}), [])).toEqual([]);
    });
  });
});
