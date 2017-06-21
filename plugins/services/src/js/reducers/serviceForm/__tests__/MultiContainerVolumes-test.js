const VolumeMounts = require("../MultiContainerVolumes");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Volumes", function() {
  describe("#JSONReducer", function() {
    it("should have an array with one object", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([{}]);
    });

    it("should have an array with one object containing a name", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo" }
      ]);
    });

    it("should have an array with one object containing only a name", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(
        new Transaction(["volumeMounts", 0, "volumeMounts", 0], "foobar")
      );

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo" }
      ]);
    });

    it("should have to items with names", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo" },
        { name: "bar" }
      ]);
    });

    it("should remove the right item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));
      batch = batch.add(new Transaction(["volumeMounts"], 0, REMOVE_ITEM));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "bar" }
      ]);
    });
  });

  describe("#FormReducer", function() {
    it("should have an array with one object", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { mountPath: [] }
      ]);
    });

    it("should have an array with one object containing a name", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { name: "foo", mountPath: [] }
      ]);
    });

    it("should have to items with names", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { name: "foo", mountPath: [] },
        { name: "bar", mountPath: [] }
      ]);
    });

    it("should remove the right item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));
      batch = batch.add(new Transaction(["volumeMounts"], 0, REMOVE_ITEM));

      expect(batch.reduce(VolumeMounts.FormReducer.bind({}), [])).toEqual([
        { name: "bar", mountPath: [] }
      ]);
    });

    it("should have to items with names and mountpath", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], 1, ADD_ITEM));
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
  });
  describe("#JSONParser", function() {
    it("should parse a simple config", function() {
      const expectedObject = [
        { type: ADD_ITEM, value: 0, path: ["volumeMounts"] },
        { type: SET, value: "foo", path: ["volumeMounts", 0, "name"] }
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
        { type: ADD_ITEM, value: 0, path: ["volumeMounts"] },
        { type: SET, value: "foo", path: ["volumeMounts", 0, "name"] },
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
        { type: ADD_ITEM, value: 0, path: ["volumeMounts"] },
        { type: SET, value: "foobar", path: ["volumeMounts", 0, "name"] },
        { type: ADD_ITEM, value: 1, path: ["volumeMounts"] },
        { type: SET, value: "foo", path: ["volumeMounts", 1, "name"] },
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
              name: "foo"
            }
          ]
        })
      ).toEqual(expectedObject);
    });
  });
});
