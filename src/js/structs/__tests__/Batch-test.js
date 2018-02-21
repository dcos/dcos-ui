const Batch = require("../Batch");
const Transaction = require("../Transaction");

let thisBatch;

describe("Batch", function() {
  beforeEach(function() {
    thisBatch = new Batch();
  });

  describe("#add", function() {
    it("does not throw an error", function() {
      expect(() => {
        thisBatch.add(new Transaction(["foo"], "test"));
      }).not.toThrow();
    });

    it("creates new batch instances", function() {
      const newBatch = thisBatch.add(new Transaction(["foo"], "test"));
      expect(newBatch).not.toBe(thisBatch);
    });
  });

  describe("#reduce", function() {
    it("iterates correctly over a batch with 1 item", function() {
      const batch = thisBatch.add(new Transaction(["foo"], "a"));
      const values = batch.reduce(function(values, item) {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(["a"]);
    });

    it("iterates correctly over a batch with 3 item", function() {
      const batch = thisBatch
        .add(new Transaction(["foo"], "a"))
        .add(new Transaction(["bar"], "b"))
        .add(new Transaction(["baz"], "c"));
      const values = batch.reduce(function(values, item) {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(["a", "b", "c"]);
    });

    it("runs reducers at least once", function() {
      const sum = thisBatch.reduce(function(sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(1);
    });

    it("passes sane arguments for reducing on empty batch", function() {
      const args = thisBatch.reduce(function(sum, action, index) {
        return [sum, action, index];
      }, "initial");

      expect(args).toEqual(["initial", { path: [], value: "INIT" }, 0]);
    });

    it("does not run reducers more than number than values", function() {
      const batch = thisBatch
        .add(new Transaction(["foo"], "a"))
        .add(new Transaction(["bar"], "b"))
        .add(new Transaction(["baz"], "c"));
      const sum = batch.reduce(function(sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(3);
    });

    it("doesn't add action if last action with same path had same value", function() {
      const batch = thisBatch
        .add(new Transaction(["foo", "bar"], "a"))
        .add(new Transaction(["foo", "foo"], "b"))
        .add(new Transaction(["foo", "bar"], "a"))
        .add(new Transaction(["foo", "bar"], "a"));
      const sum = batch.reduce(function(sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(3);
    });

    it("keeps all ", function() {
      const batch = thisBatch
        .add(new Transaction(["id"], "a"))
        .add(new Transaction(["cpu"], 1))
        .add(new Transaction(["id"], "b"))
        .add(new Transaction(["mem"], 1))
        .add(new Transaction(["id"], "a"));
      const sum = batch.reduce(function(sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(5);
    });
  });
});
