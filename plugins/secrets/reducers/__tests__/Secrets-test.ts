import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import {
  JSONSingleContainerReducer,
  JSONSingleContainerParser,
  FormSingleContainerReducer,
  JSONMultiContainerReducer,
  JSONMultiContainerParser,
  FormMultiContainerReducer,
  emptySingleContainerSecret,
  emptyMultiContainerSecret,
  removeSecretVolumes
} from "../Secrets";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

let thisBatch;

describe("Secrets", () => {
  describe("Single Container", () => {
    describe("JSONSingleContainerReducer", () => {
      beforeEach(() => {
        thisBatch = new Batch([
          new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM),
          new Transaction(["secrets", 0, "value"], "database_password", SET),
          new Transaction(
            ["secrets", 0, "exposures"],
            { type: "", value: "" },
            ADD_ITEM
          ),
          new Transaction(
            ["secrets", 0, "exposures", 0, "type"],
            "envVar",
            SET
          ),
          new Transaction(
            ["secrets", 0, "exposures", 0, "value"],
            "DB_PASS",
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
          secret0: {
            source: "database_password"
          }
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

        const definition = batch.reduce(
          JSONSingleContainerReducer.bind({}),
          {}
        );

        expect(definition).toEqual({
          secret0: {
            source: "database_password"
          },
          secret1: {
            source: "redis_pass"
          }
        });
      });

      it("removes element", () => {
        const batch = thisBatch.add(
          new Transaction(["secrets"], 0, REMOVE_ITEM)
        );

        const definition = batch.reduce(
          JSONSingleContainerReducer.bind({}),
          {}
        );

        expect(definition).toEqual({});
      });

      it("keeps the secret if only one env var has been deleted", () => {
        let batch = thisBatch.add(
          new Transaction(
            ["secrets", 0, "exposures", 1],
            { type: "envVar", value: "REDIS_PASS" },
            SET
          )
        );
        batch = batch.add(
          new Transaction(["secrets", 0, "exposures"], 0, REMOVE_ITEM)
        );

        const definition = batch.reduce(
          JSONSingleContainerReducer.bind({}),
          {}
        );

        expect(definition).toEqual({
          secret0: {
            source: "database_password"
          }
        });
      });
    });

    describe("JSONSingleContainerParser", () => {
      it("parses a complete definition", () => {
        const json = {
          env: {
            DB_PASS: {
              secret: "secret0"
            }
          },
          secrets: {
            secret0: {
              source: "database_password"
            }
          }
        };

        expect(JSONSingleContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptySingleContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "database_password",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "DB_PASS" },
            path: ["secrets", 0, "exposures"]
          }
        ]);
      });

      it("parses a complete definition with file", () => {
        const json = {
          container: {
            type: "MESOS",
            volumes: [
              {
                containerPath: "secrets/sa.json",
                secret: "secret0"
              }
            ]
          },
          secrets: {
            secret0: {
              source: "service_account"
            }
          }
        };

        expect(JSONSingleContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptySingleContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "service_account",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: { type: "file", value: "secrets/sa.json" },
            path: ["secrets", 0, "exposures"]
          }
        ]);
      });

      it("parses multiple vars sharing one secret", () => {
        const json = {
          env: {
            DB_PASS: {
              secret: "secret0"
            },
            REDIS_PASS: {
              secret: "secret0"
            },
            MEMCACHE_PASS: {
              secret: "secret0"
            }
          },
          secrets: {
            secret0: {
              source: "root_password"
            }
          }
        };

        expect(JSONSingleContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptySingleContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "root_password",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "DB_PASS" },
            path: ["secrets", 0, "exposures"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "REDIS_PASS" },
            path: ["secrets", 0, "exposures"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "MEMCACHE_PASS" },
            path: ["secrets", 0, "exposures"]
          }
        ]);
      });

      it("parses a partial definition", () => {
        const json = {
          secrets: {
            secret0: {
              source: "database_password"
            }
          }
        };

        expect(JSONSingleContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptySingleContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "database_password",
            path: ["secrets", 0, "value"]
          }
        ]);
      });

      it("parses files and var sharing one secret", () => {
        const json = {
          container: {
            type: "MESOS",
            volumes: [
              {
                containerPath: "secrets/db_pass",
                secret: "secret0"
              }
            ]
          },
          env: {
            DB_PASS: {
              secret: "secret0"
            }
          },
          secrets: {
            secret0: {
              source: "root_password"
            }
          }
        };

        expect(JSONSingleContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptySingleContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "root_password",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "DB_PASS" },
            path: ["secrets", 0, "exposures"]
          },
          {
            type: ADD_ITEM,
            value: { type: "file", value: "secrets/db_pass" },
            path: ["secrets", 0, "exposures"]
          }
        ]);
      });
    });

    describe("FormSingleContainerReducer", () => {
      beforeEach(() => {
        thisBatch = new Batch([
          new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM),
          new Transaction(["secrets", 0, "value"], "database_password", SET),
          new Transaction(
            ["secrets", 0, "exposures", 0],
            { type: "envVar", value: "DB_PASS" },
            SET
          )
        ]);
      });

      it("generates correct definition", () => {
        const state = thisBatch.reduce(FormSingleContainerReducer, []);

        expect(state).toEqual([
          {
            exposures: [{ type: "envVar", value: "DB_PASS" }],
            key: null,
            value: "database_password"
          }
        ]);
      });

      it("generates definition with files", () => {
        let batch = thisBatch.add(
          new Transaction(["secrets"], emptySingleContainerSecret(), ADD_ITEM)
        );
        batch = batch.add(
          new Transaction(["secrets", 1, "value"], "service_account", SET)
        );
        batch = batch.add(
          new Transaction(
            ["secrets", 1, "exposures", 0],
            { type: "file", value: "secrets/sa.json" },
            SET
          )
        );

        const state = batch.reduce(FormSingleContainerReducer, []);

        expect(state).toEqual([
          {
            exposures: [{ type: "envVar", value: "DB_PASS" }],
            key: null,
            value: "database_password"
          },
          {
            exposures: [{ type: "file", value: "secrets/sa.json" }],
            value: "service_account",
            key: null
          }
        ]);
      });
    });
  });
  describe("Multi-Container", () => {
    describe("JSONMultiContainerReducer", () => {
      beforeEach(() => {
        thisBatch = new Batch([
          new Transaction(
            ["secrets"],
            { environmentVars: [], key: null, value: null },
            ADD_ITEM
          ),
          new Transaction(["secrets", 0, "value"], "database_password", SET),
          new Transaction(["secrets", 0, "environmentVars", 0], "DB_PASS", SET)
        ]);
      });

      it("generates correct definition", () => {
        const definition = thisBatch.reduce(
          JSONMultiContainerReducer.bind({}),
          {}
        );

        expect(definition).toEqual({
          secret0: {
            source: "database_password"
          }
        });
      });

      it("handles multiple secrets", () => {
        let batch = thisBatch.add(
          new Transaction(
            ["secrets"],
            { environmentVars: [], key: null, value: null },
            ADD_ITEM
          )
        );
        batch = batch.add(
          new Transaction(["secrets", 1, "value"], "redis_pass", SET)
        );
        batch = batch.add(
          new Transaction(
            ["secrets", 1, "environmentVars", 0],
            "REDIS_PASS",
            SET
          )
        );

        const definition = batch.reduce(JSONMultiContainerReducer.bind({}), {});

        expect(definition).toEqual({
          secret0: {
            source: "database_password"
          },
          secret1: {
            source: "redis_pass"
          }
        });
      });

      it("removes element", () => {
        const batch = thisBatch.add(
          new Transaction(["secrets"], 0, REMOVE_ITEM)
        );

        const definition = batch.reduce(JSONMultiContainerReducer.bind({}), {});

        expect(definition).toEqual({});
      });

      it("keeps the secret if only one env var has been deleted", () => {
        let batch = thisBatch.add(
          new Transaction(
            ["secrets", 0, "environmentVars", 1],
            "REDIS_PASS",
            SET
          )
        );
        batch = thisBatch.add(
          new Transaction(["secrets", 0, "environmentVars"], 0, REMOVE_ITEM)
        );

        const definition = batch.reduce(JSONMultiContainerReducer.bind({}), {});

        expect(definition).toEqual({
          secret0: {
            source: "database_password"
          }
        });
      });
    });

    describe("JSONMultiContainerParser", () => {
      it("parses a complete definition", () => {
        const json = {
          env: {
            DB_PASS: {
              secret: "secret0"
            }
          },
          secrets: {
            secret0: {
              source: "database_password"
            }
          }
        };

        expect(JSONMultiContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptyMultiContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "database_password",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "DB_PASS" },
            path: ["secrets", 0, "exposures"]
          }
        ]);
      });

      it("parses multiple vars sharing one secret", () => {
        const json = {
          env: {
            DB_PASS: {
              secret: "secret0"
            },
            REDIS_PASS: {
              secret: "secret0"
            },
            MEMCACHE_PASS: {
              secret: "secret0"
            }
          },
          secrets: {
            secret0: {
              source: "root_password"
            }
          }
        };

        expect(JSONMultiContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptyMultiContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "root_password",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "DB_PASS" },
            path: ["secrets", 0, "exposures"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "REDIS_PASS" },
            path: ["secrets", 0, "exposures"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "MEMCACHE_PASS" },
            path: ["secrets", 0, "exposures"]
          }
        ]);
      });

      it("parses a complete definition for a multi container", () => {
        const json = {
          environment: {
            DB_PASS: {
              secret: "secret0"
            }
          },
          secrets: {
            secret0: {
              source: "database_password"
            }
          }
        };

        expect(JSONMultiContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptyMultiContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "database_password",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: { type: "envVar", value: "DB_PASS" },
            path: ["secrets", 0, "exposures"]
          }
        ]);
      });

      it("parses a partial definition", () => {
        const json = {
          secrets: {
            secret0: {
              source: "database_password"
            }
          }
        };

        expect(JSONMultiContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptyMultiContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "database_password",
            path: ["secrets", 0, "value"]
          }
        ]);
      });

      it("large json", () => {
        const json = JSON.parse(
          `{"id":"/rodney-test","containers":[{"name":"container-1","resources":{"cpus":0.1,"mem":128},"volumeMounts":[{"name":"p_test","mountPath":"data"},{"name":"test","mountPath":"secrets/test"},{"name":"secret1volume1","mountPath":"secret"}]},{"name":"container-2","resources":{"cpus":0.1,"mem":128},"volumeMounts":[{"name":"secret1volume1","mountPath":"thing"}]},{"name":"container-3","resources":{"cpus":0.1,"mem":128},"volumeMounts":[{"name":"p_test","mountPath":"files"},{"name":"test","mountPath":"secrets/tttt"},{"name":"secret1volume1","mountPath":"for"}]}],"scaling":{"instances":1,"kind":"fixed"},"networks":[{"mode":"host"}],"volumes":[{"persistent":{"size":10},"name":"p_test"},{"name":"test","secret":"secret0"},{"name":"secret1volume1","secret":"secret1"}],"fetch":[],"scheduling":{"placement":{"constraints":[]}},"secrets":{"secret0":{"source":"TEST"},"secret1":{"source":"OTHER"}}}`
        );

        expect(JSONMultiContainerParser(json)).toEqual([
          {
            type: ADD_ITEM,
            value: emptyMultiContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret0", path: ["secrets", 0, "key"] },
          {
            type: SET,
            value: "TEST",
            path: ["secrets", 0, "value"]
          },
          {
            type: ADD_ITEM,
            value: {
              type: "file",
              value: "test",
              mounts: ["secrets/test", "", "secrets/tttt"]
            },
            path: ["secrets", 0, "exposures"]
          },
          {
            type: ADD_ITEM,
            value: emptyMultiContainerSecret(),
            path: ["secrets"]
          },
          { type: SET, value: "secret1", path: ["secrets", 1, "key"] },
          {
            type: SET,
            value: "OTHER",
            path: ["secrets", 1, "value"]
          },
          {
            type: ADD_ITEM,
            value: {
              type: "file",
              value: "secret1volume1",
              mounts: ["secret", "thing", "for"]
            },
            path: ["secrets", 1, "exposures"]
          }
        ]);
      });
    });

    describe("FormMultiContainerReducer", () => {
      beforeEach(() => {
        thisBatch = new Batch([
          new Transaction(["secrets"], emptyMultiContainerSecret(), ADD_ITEM),
          new Transaction(["secrets", 0, "value"], "database_password", SET),
          new Transaction(
            ["secrets", 0, "exposures"],
            { type: "", value: "" },
            ADD_ITEM
          ),
          new Transaction(
            ["secrets", 0, "exposures", 0, "type"],
            "envVar",
            SET
          ),
          new Transaction(
            ["secrets", 0, "exposures", 0, "value"],
            "DB_PASS",
            SET
          )
        ]);
      });

      it("generates correct definition", () => {
        const state = thisBatch.reduce(FormMultiContainerReducer, []);

        expect(state).toEqual([
          {
            exposures: [{ type: "envVar", value: "DB_PASS" }],
            value: "database_password",
            key: null
          }
        ]);
      });
    });
  });

  describe("Utilities", () => {
    describe("#removeSecretVolumes", () => {
      it("can handle empty state", () => {
        expect(removeSecretVolumes({})).toEqual({});
      });
      it("removes secret volumes", () => {
        const state = {
          volumes: [
            {
              name: "other",
              persistent: {
                size: 10
              }
            },
            {
              name: "secret-test",
              secret: "my_secret"
            }
          ]
        };
        expect(removeSecretVolumes(state)).toEqual({
          volumes: [
            {
              name: "other",
              persistent: {
                size: 10
              }
            }
          ]
        });
      });

      it("removes multiple secret volumes and mounts", () => {
        const state = {
          containers: [
            {
              name: "test-1",
              volumeMounts: [
                {
                  name: "other",
                  mountPath: "data"
                },
                {
                  name: "secret-test",
                  mountPath: "secrets/thing"
                }
              ]
            },
            {
              name: "test-2",
              volumeMounts: [
                {
                  name: "secret-test",
                  mountPath: "secrets/thing"
                },
                {
                  name: "secret-test-2",
                  mountPath: "secrets/other"
                }
              ]
            }
          ],
          volumes: [
            {
              name: "other",
              persistent: {
                size: 10
              }
            },
            {
              name: "secret-test",
              secret: "my_secret"
            },
            {
              name: "secret-test-2",
              secret: "other_secert"
            }
          ],
          secrets: {
            my_secret: {
              source: "TEST"
            },
            other_secert: {
              source: "OTHER_TEST"
            }
          }
        };
        expect(removeSecretVolumes(state)).toEqual({
          containers: [
            {
              name: "test-1",
              volumeMounts: [
                {
                  name: "other",
                  mountPath: "data"
                }
              ]
            },
            {
              name: "test-2",
              volumeMounts: []
            }
          ],
          volumes: [
            {
              name: "other",
              persistent: {
                size: 10
              }
            }
          ],
          secrets: {
            my_secret: {
              source: "TEST"
            },
            other_secert: {
              source: "OTHER_TEST"
            }
          }
        });
      });

      it("can handle no volumes", () => {
        const state = {
          containers: [
            {
              name: "test-1"
            },
            {
              name: "test-2"
            }
          ],
          secrets: {
            my_secret: {
              source: "TEST"
            },
            other_secert: {
              source: "OTHER_TEST"
            }
          }
        };
        expect(removeSecretVolumes(state)).toEqual({
          containers: [
            {
              name: "test-1"
            },
            {
              name: "test-2"
            }
          ],
          secrets: {
            my_secret: {
              source: "TEST"
            },
            other_secert: {
              source: "OTHER_TEST"
            }
          }
        });
      });

      it("can handle empty containers", () => {
        const state = {
          containers: [],
          volumes: [
            {
              name: "other",
              persistent: {
                size: 10
              }
            },
            {
              name: "secret-test",
              secret: "my_secret"
            },
            {
              name: "secret-test-2",
              secret: "other_secert"
            }
          ],
          secrets: {
            my_secret: {
              source: "TEST"
            },
            other_secert: {
              source: "OTHER_TEST"
            }
          }
        };
        expect(removeSecretVolumes(state)).toEqual({
          containers: [],
          volumes: [
            {
              name: "other",
              persistent: {
                size: 10
              }
            }
          ],
          secrets: {
            my_secret: {
              source: "TEST"
            },
            other_secert: {
              source: "OTHER_TEST"
            }
          }
        });
      });
    });
  });
});
