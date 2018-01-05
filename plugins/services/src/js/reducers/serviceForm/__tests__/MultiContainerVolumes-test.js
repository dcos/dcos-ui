const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const VolumeMounts = require("../MultiContainerVolumes");

describe("Volumes", function() {
  describe("#JSONReducer", function() {
    describe("with an initial value in ADD_ITEM transaction", function() {
      it("emits the value", function() {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["volumeMounts"], { defaultValue: "foo" }, ADD_ITEM)
        );

        expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
          { defaultValue: "foo" }
        ]);
      });
    });

    describe("with no initial value in ADD_ITEM transaction", function() {
      it("should have an array with one object", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));

        expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
          {}
        ]);
      });
    });

    it("should have an array with one object containing a name", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo" }
      ]);
    });

    it("should have an array with one object containing only a name", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "volumeMounts", 0], "foobar")
      );

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo" }
      ]);
    });

    it("should have two items with names", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "volumeMounts", 0], "foobar")
      );

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo" }
      ]);
    });

    it("should have two items with names", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo" },
        { name: "bar" }
      ]);
    });

    it("should remove the right item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));
      batch = batch.add(new Transaction(["volumeMounts"], 0, REMOVE_ITEM));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "bar" }
      ]);
    });

    it("handles HOST type", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 0, "type"], "HOST"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "hostPath"], "hostpath")
      );

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo", host: "hostpath" }
      ]);
    });
    it("handles PERSISTENT type", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "type"], "PERSISTENT")
      );
      batch = batch.add(new Transaction(["volumeMounts", 0, "size"], "1"));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo", persistent: { size: 1 } }
      ]);
    });
  });

  describe("#FormReducer", function() {
    it("should have an array with one object", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { mountPath: [] }
      ]);
    });

    it("should have an array with one object containing a name", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { name: "foo", mountPath: [] }
      ]);
    });

    it("should have two items with names", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { name: "foo", mountPath: [] },
        { name: "bar", mountPath: [] }
      ]);
    });

    it("should remove the right item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));
      batch = batch.add(new Transaction(["volumeMounts"], 0, REMOVE_ITEM));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { name: "bar", mountPath: [] }
      ]);
    });

    it("should have two items with names and mountpath", function() {
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

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
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
    it("handles PERSISTENT type", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "type"], "PERSISTENT")
      );
      batch = batch.add(new Transaction(["volumeMounts", 0, "size"], 1));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { name: "foo", size: 1, type: "PERSISTENT", mountPath: [] }
      ]);
    });
  });

  describe("#JSONParser", function() {
    it("should parse a simple config", function() {
      const expectedObject = [
        { type: ADD_ITEM, value: { name: "foo" }, path: ["volumeMounts"] },
        { type: SET, value: "foo", path: ["volumeMounts", 0, "name"] },
        { type: SET, value: "EPHEMERAL", path: ["volumeMounts", 0, "type"] }
      ];

      expect(
        VolumeMounts.JSONParser({
          containers: [],
          volumes: [
            {
              name: "foo"
            }
          ]
        })
      ).toEqual(expectedObject);
    });

    it("should parse a normal config", function() {
      const expectedObject = [
        { type: ADD_ITEM, value: { name: "foo" }, path: ["volumeMounts"] },
        { type: SET, value: "foo", path: ["volumeMounts", 0, "name"] },
        { type: SET, value: "EPHEMERAL", path: ["volumeMounts", 0, "type"] },
        { type: SET, value: "bar", path: ["volumeMounts", 0, "mountPath", 0] }
      ];

      expect(
        VolumeMounts.JSONParser({
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

    it("should parse a advanced config", function() {
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
        VolumeMounts.JSONParser({
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

    it("parses unknown volumes", function() {
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
        VolumeMounts.JSONParser({
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
    it("parses a persistent volume config", function() {
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
        VolumeMounts.JSONParser({
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
