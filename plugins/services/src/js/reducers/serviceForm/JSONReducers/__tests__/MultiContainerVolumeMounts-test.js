const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const { ADD_ITEM, REMOVE_ITEM } = require("#SRC/js/constants/TransactionTypes");
const VolumeMounts = require("../MultiContainerVolumeMounts");

describe("MultiContainerVolumeMounts", function() {
  describe("#JSONReducer", function() {
    it("should have an array with one object", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { mountPath: [] }
      ]);
    });

    it("should have an array with one object containing a name", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
        { name: "foo", mountPath: [] }
      ]);
    });

    it("should have to items with names", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumeMounts"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["volumeMounts", 0, "name"], "foo"));
      batch = batch.add(new Transaction(["volumeMounts", 1, "name"], "bar"));

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
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

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
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

      expect(batch.reduce(VolumeMounts.JSONReducer.bind({}), [])).toEqual([
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
});
