import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import { emptyMultiContainerSecret } from "../Secrets";
import { JSONReducer } from "../Containers";
// @ts-ignore
import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

let thisBatch: Batch;

describe("Secrets Containers", () => {
  describe("#JSONReducer", () => {
    beforeEach(() => {
      thisBatch = new Batch([
        new Transaction(["secrets"], emptyMultiContainerSecret(), ADD_ITEM),
        new Transaction(["secrets", 0, "value"], "service_account", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0],
          {
            type: "",
            value: ""
          },
          SET
        ),
        new Transaction(["secrets", 0, "exposures", 0, "type"], "file", SET),
        new Transaction(
          ["secrets", 0, "exposures", 0, "mounts", 0],
          "secrets/sa",
          SET
        )
      ]);
    });

    it("return provided state if no secrets are set", () => {
      const batch = new Batch();

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([]);
    });

    it("generates correct definition", () => {
      expect(
        thisBatch.reduce(JSONReducer.bind({}), [
          {
            name: "test",
            resources: { cpu: 0.1, mem: 128 }
          }
        ])
      ).toEqual([
        {
          name: "test",
          resources: {
            cpu: 0.1,
            mem: 128
          },
          volumeMounts: [
            {
              name: "secret0volume0",
              mountPath: "secrets/sa"
            }
          ]
        }
      ]);
    });

    it("adds to existing volumeMounts", () => {
      expect(
        thisBatch.reduce(
          JSONReducer.bind({
            volumeMounts: [
              {
                name: "thing",
                mountPath: ["data"]
              }
            ]
          }),
          [
            {
              name: "test",
              resources: { cpu: 0.1, mem: 128 },
              volumeMounts: [
                {
                  name: "thing",
                  mountPath: "data"
                }
              ]
            }
          ]
        )
      ).toEqual([
        {
          name: "test",
          resources: {
            cpu: 0.1,
            mem: 128
          },
          volumeMounts: [
            {
              name: "thing",
              mountPath: "data"
            },
            {
              name: "secret0volume0",
              mountPath: "secrets/sa"
            }
          ]
        }
      ]);
    });

    it("can set specific container mountPath", () => {
      thisBatch = thisBatch.add(
        new Transaction(["secrets", 0, "exposures", 0, "mounts", 0], "", SET)
      );
      thisBatch = thisBatch.add(
        new Transaction(
          ["secrets", 0, "exposures", 0, "mounts", 1],
          "secrets/sa",
          SET
        )
      );

      expect(
        thisBatch.reduce(JSONReducer.bind({}), [
          {
            name: "test-1",
            resources: { cpu: 0.1, mem: 128 }
          },
          {
            name: "test-2",
            resources: { cpu: 0.1, mem: 128 }
          }
        ])
      ).toEqual([
        {
          name: "test-1",
          resources: {
            cpu: 0.1,
            mem: 128
          }
        },
        {
          name: "test-2",
          resources: {
            cpu: 0.1,
            mem: 128
          },
          volumeMounts: [
            {
              name: "secret0volume0",
              mountPath: "secrets/sa"
            }
          ]
        }
      ]);
    });

    it("leaves existing mounts when setting specific mountPath", () => {
      thisBatch = thisBatch.add(
        new Transaction(["secrets", 0, "exposures", 0, "mounts", 0], "", SET)
      );
      thisBatch = thisBatch.add(
        new Transaction(
          ["secrets", 0, "exposures", 0, "mounts", 1],
          "secrets/sa",
          SET
        )
      );

      expect(
        thisBatch.reduce(
          JSONReducer.bind({
            volumeMounts: [
              {
                name: "test-volume",
                mountPath: ["my_path", ""]
              }
            ]
          }),
          [
            {
              name: "test-1",
              resources: { cpu: 0.1, mem: 128 },
              volumeMounts: [
                {
                  name: "test-volume",
                  mountPath: "my_path"
                }
              ]
            },
            {
              name: "test-2",
              resources: { cpu: 0.1, mem: 128 }
            }
          ]
        )
      ).toEqual([
        {
          name: "test-1",
          resources: {
            cpu: 0.1,
            mem: 128
          },
          volumeMounts: [
            {
              name: "test-volume",
              mountPath: "my_path"
            }
          ]
        },
        {
          name: "test-2",
          resources: {
            cpu: 0.1,
            mem: 128
          },
          volumeMounts: [
            {
              name: "secret0volume0",
              mountPath: "secrets/sa"
            }
          ]
        }
      ]);
    });

    it("removes volumeMounts when exposure removed", () => {
      thisBatch = thisBatch.add(
        new Transaction(["secrets", "0", "exposures"], 0, REMOVE_ITEM)
      );

      expect(
        thisBatch.reduce(JSONReducer.bind({}), [
          {
            name: "test",
            resources: { cpu: 0.1, mem: 128 }
          }
        ])
      ).toEqual([
        {
          name: "test",
          resources: {
            cpu: 0.1,
            mem: 128
          }
        }
      ]);
    });

    it("removes volumeMounts when exposure type changed", () => {
      thisBatch = thisBatch.add(
        new Transaction(["secrets", 0, "exposures", 0, "type"], "envVar", SET)
      );
      thisBatch = thisBatch.add(
        new Transaction(["secrets", 0, "exposures", 0, "value"], "TEST", SET)
      );
      expect(
        thisBatch.reduce(JSONReducer.bind({}), [
          {
            name: "test",
            resources: { cpu: 0.1, mem: 128 }
          }
        ])
      ).toEqual([
        {
          name: "test",
          resources: {
            cpu: 0.1,
            mem: 128
          }
        }
      ]);
    });

    it("removes volumeMounts when exposure mountPath removed", () => {
      thisBatch = thisBatch.add(
        new Transaction(["secrets", 0, "exposures", 0, "mounts", 0], "", SET)
      );

      expect(
        thisBatch.reduce(JSONReducer.bind({}), [
          {
            name: "test",
            resources: { cpu: 0.1, mem: 128 }
          }
        ])
      ).toEqual([
        {
          name: "test",
          resources: {
            cpu: 0.1,
            mem: 128
          }
        }
      ]);
    });

    it("removes secret volumeMounts when secret removed", () => {
      thisBatch = thisBatch.add(new Transaction(["secrets"], 0, REMOVE_ITEM));

      expect(
        thisBatch.reduce(JSONReducer.bind({}), [
          {
            name: "test",
            resources: { cpu: 0.1, mem: 128 }
          }
        ])
      ).toEqual([
        {
          name: "test",
          resources: {
            cpu: 0.1,
            mem: 128
          }
        }
      ]);
    });

    it("leaves existing volumeMounts when secret removed", () => {
      thisBatch = thisBatch.add(new Transaction(["secrets"], 0, REMOVE_ITEM));

      expect(
        thisBatch.reduce(
          JSONReducer.bind({
            volumeMounts: [
              {
                name: "thing",
                mountPath: ["thing"]
              }
            ]
          }),
          [
            {
              name: "test",
              resources: { cpu: 0.1, mem: 128 }
            }
          ]
        )
      ).toEqual([
        {
          name: "test",
          resources: {
            cpu: 0.1,
            mem: 128
          },
          volumeMounts: [
            {
              name: "thing",
              mountPath: "thing"
            }
          ]
        }
      ]);
    });
  });
});
