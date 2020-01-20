import { ADD_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import { JSONSingleContainerReducer } from "../Container";
import { emptySingleContainerSecret } from "../Secrets";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

let thisBatch;

describe("Secrets Container", () => {
  describe("#JSONSingleContainerReducer", () => {
    beforeEach(() => {
      thisBatch = new Batch([
        new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM),
        new Transaction(["secrets", 0, "value"], "service_account", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0],
          { type: "file", value: "secrets/sa" },
          SET
        )
      ]);
    });

    it("generates correct definition", () => {
      const definition = thisBatch.reduce(
        JSONSingleContainerReducer.bind({}),
        {}
      );

      expect(definition).toEqual({
        volumes: [
          {
            containerPath: "secrets/sa",
            secret: "secret0"
          }
        ]
      });
    });

    it("extends existing state", () => {
      const state = {
        type: "MESOS",
        volumes: [
          {
            mode: "RW",
            containerPath: "data"
          }
        ]
      };
      const definition = thisBatch.reduce(
        JSONSingleContainerReducer.bind({}),
        state
      );

      expect(definition).toEqual({
        type: "MESOS",
        volumes: [
          {
            mode: "RW",
            containerPath: "data"
          },
          {
            containerPath: "secrets/sa",
            secret: "secret0"
          }
        ]
      });
    });
  });
});
