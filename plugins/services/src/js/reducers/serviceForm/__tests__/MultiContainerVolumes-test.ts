import Transaction from "#SRC/js/structs/Transaction";

import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Batch from "#SRC/js/structs/Batch";
import {
  MultiContainerVolumeMountsJSONReducer as JSONReducer,
  MultiContainerVolumeMountsJSONParser as JSONParser,
  FormReducer
} from "../MultiContainerVolumes";

describe("Volumes", () => {
  describe("#JSONReducer", () => {
    describe("with an initial value in ADD_ITEM transaction", () => {
      it("emits the value", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["volumeMounts"], { defaultValue: "foo" }, ADD_ITEM)
        );

        expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([
          { defaultValue: "foo" }
        ]);
      });
    });

    describe("with no initial value in ADD_ITEM transaction", () => {
      it("has an array with one object", () => {
        let batch = new Batch();
        batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));

        expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([{}]);
      });
    });

    it("has an array with one object containing a name", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([{ name: "foo" }]);
    });

    it("has an array with one object containing only a name", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "volumeMounts", 0], "foobar")
      );

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([{ name: "foo" }]);
    });

    it("has two items with names", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "volumeMounts", 0], "foobar")
      );

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([{ name: "foo" }]);
    });

    it("has two items with names", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([
        { name: "foo" },
        { name: "bar" }
      ]);
    });

    it("removes the right item", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));
      batch = batch.add(new Transaction(["volumeMounts"], 0, REMOVE_ITEM));

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([{ name: "bar" }]);
    });

    it("handles HOST type", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 0, "type"], "HOST"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "hostPath"], "hostpath")
      );

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([
        { name: "foo", host: "hostpath" }
      ]);
    });
    it("handles PERSISTENT type", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "type"], "PERSISTENT")
      );
      batch = batch.add(new Transaction(["volumeMounts", 0, "size"], "1"));

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([
        { name: "foo", persistent: { size: 1 } }
      ]);
    });
    it("handles DSS type", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 0, "type"], "DSS"));
      batch = batch.add(new Transaction(["volumeMounts", 0, "size"], "1"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "profileName"], "dev")
      );

      expect(batch.reduce(JSONReducer.bind({}), [])).toEqual([
        {
          name: "foo",
          persistent: { size: 1, type: "mount", profileName: "dev" }
        }
      ]);
    });
  });

  describe("#FormReducer", () => {
    it("has an array with one object", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));

      expect(batch.reduce(FormReducer.bind({}), [])).toEqual([
        { mountPath: [] }
      ]);
    });

    it("has an array with one object containing a name", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));

      expect(batch.reduce(FormReducer.bind({}), [])).toEqual([
        { name: "foo", mountPath: [] }
      ]);
    });

    it("has two items with names", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));

      expect(batch.reduce(FormReducer.bind({}), [])).toEqual([
        { name: "foo", mountPath: [] },
        { name: "bar", mountPath: [] }
      ]);
    });

    it("removes the right item", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));
      batch = batch.add(new Transaction(["volumeMounts"], 0, REMOVE_ITEM));

      expect(batch.reduce(FormReducer.bind({}), [])).toEqual([
        { name: "bar", mountPath: [] }
      ]);
    });

    it("has two items with names and mountpath", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "mountPath", 0], "foobar")
      );
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));
      batch = batch.add(
        new Transaction(["volumeMounts", 1, "mountPath", 0], "barfoo")
      );

      expect(batch.reduce(FormReducer.bind({}), [])).toEqual([
        {
          name: "foo",
          mountPath: ["foobar"]
        },
        {
          name: "bar",
          mountPath: ["barfoo"]
        }
      ]);
    });
    it("handles PERSISTENT type", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "type"], "PERSISTENT")
      );
      batch = batch.add(new Transaction(["volumeMounts", 0, "size"], 1));

      expect(batch.reduce(FormReducer.bind({}), [])).toEqual([
        { name: "foo", size: 1, type: "PERSISTENT", mountPath: [] }
      ]);
    });
  });

  describe("#JSONParser", () => {
    it("parses a simple config", () => {
      const expectedObject = [
        { type: ADD_ITEM, value: { name: "foo" }, path: ["volumeMounts"] },
        { type: SET, value: "foo", path: ["volumeMounts", 0, "name"] },
        { type: SET, value: "EPHEMERAL", path: ["volumeMounts", 0, "type"] }
      ];

      expect(
        JSONParser({
          containers: [],
          volumes: [
            {
              name: "foo"
            }
          ]
        })
      ).toEqual(expectedObject);
    });

    it("parses a normal config", () => {
      const expectedObject = [
        { type: ADD_ITEM, value: { name: "foo" }, path: ["volumeMounts"] },
        { type: SET, value: "foo", path: ["volumeMounts", 0, "name"] },
        { type: SET, value: "EPHEMERAL", path: ["volumeMounts", 0, "type"] },
        { type: SET, value: "bar", path: ["volumeMounts", 0, "mountPath", 0] }
      ];

      expect(
        JSONParser({
          containers: [
            {
              volumeMounts: [
                {
                  name: "foo",
                  mountPath: "bar"
                }
              ]
            }
          ],
          volumes: [
            {
              name: "foo"
            }
          ]
        })
      ).toEqual(expectedObject);
    });

    it("parses a advanced config", () => {
      const expectedObject = [
        { type: ADD_ITEM, value: { name: "foobar" }, path: ["volumeMounts"] },
        { type: SET, value: "foobar", path: ["volumeMounts", 0, "name"] },
        { type: SET, value: "EPHEMERAL", path: ["volumeMounts", 0, "type"] },
        {
          type: ADD_ITEM,
          value: { host: "foopath", name: "foo" },
          path: ["volumeMounts"]
        },
        { type: SET, value: "foo", path: ["volumeMounts", 1, "name"] },
        { type: SET, value: "HOST", path: ["volumeMounts", 1, "type"] },
        { type: SET, value: "foopath", path: ["volumeMounts", 1, "hostPath"] },
        { type: SET, value: "bar", path: ["volumeMounts", 1, "mountPath", 0] },
        {
          type: SET,
          value: "fooBar",
          path: ["volumeMounts", 1, "mountPath", 1]
        }
      ];

      expect(
        JSONParser({
          containers: [
            {
              volumeMounts: [
                {
                  name: "foo",
                  mountPath: "bar"
                }
              ]
            },
            {
              volumeMounts: [
                {
                  name: "foo",
                  mountPath: "fooBar"
                }
              ]
            }
          ],
          volumes: [
            {
              name: "foobar"
            },
            {
              name: "foo",
              host: "foopath"
            }
          ]
        })
      ).toEqual(expectedObject);
    });

    it("parses unknown volumes", () => {
      const expectedObject = [
        {
          type: ADD_ITEM,
          value: { unknownField: "foo", name: "unknown volume" },
          path: ["volumeMounts"]
        },
        {
          type: SET,
          value: "unknown volume",
          path: ["volumeMounts", 0, "name"]
        },
        { type: SET, value: "UNKNOWN", path: ["volumeMounts", 0, "type"] }
      ];

      expect(
        JSONParser({
          containers: [],
          volumes: [
            {
              name: "unknown volume",
              unknownField: "foo"
            }
          ]
        })
      ).toEqual(expectedObject);
    });
    it("parses a persistent volume config", () => {
      const expectedObject = [
        {
          type: ADD_ITEM,
          value: { name: "foo", persistent: { size: 1 } },
          path: ["volumeMounts"]
        },
        { type: SET, value: "foo", path: ["volumeMounts", 0, "name"] },
        {
          type: SET,
          value: "PERSISTENT",
          path: ["volumeMounts", 0, "type"]
        },
        {
          type: SET,
          value: { size: 1 },
          path: ["volumeMounts", 0, "persistent"]
        }
      ];

      expect(
        JSONParser({
          containers: [],
          volumes: [
            {
              name: "foo",
              persistent: {
                size: 1
              }
            }
          ]
        })
      ).toEqual(expectedObject);
    });
  });
});
