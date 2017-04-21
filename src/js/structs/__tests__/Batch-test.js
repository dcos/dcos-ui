const Batch = require("../Batch");
const Transaction = require("../Transaction");

describe("Batch", function() {
  beforeEach(function() {
    this.batch = new Batch();
  });

  describe("#add", function() {
    it("should not throw an error", function() {
      expect(() => {
        this.batch.add(new Transaction(["foo"], "test"));
      }).not.toThrow();
    });

    it("should create new batch instances", function() {
      const newBatch = this.batch.add(new Transaction(["foo"], "test"));
      expect(newBatch).not.toBe(this.batch);
    });
  });

  describe("#reduce", function() {
    it("should iterate correctly over a batch with 1 item", function() {
      const batch = this.batch.add(new Transaction(["foo"], "a"));
      const values = batch.reduce(function(values, item) {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(["a"]);
    });

    it("should iterate correctly over a batch with 3 item", function() {
      const batch = this.batch
        .add(new Transaction(["foo"], "a"))
        .add(new Transaction(["bar"], "b"))
        .add(new Transaction(["baz"], "c"));
      const values = batch.reduce(function(values, item) {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(["a", "b", "c"]);
    });

    it("should run reducers at least once", function() {
      const sum = this.batch.reduce(function(sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(1);
    });

    it("should pass sane arguments for reducing on empty batch", function() {
      const args = this.batch.reduce(function(sum, action, index) {
        return [sum, action, index];
      }, "initial");

      expect(args).toEqual(["initial", { path: [], value: "INIT" }, 0]);
    });

    it("should not run reducers more than number than values", function() {
      const batch = this.batch
        .add(new Transaction(["foo"], "a"))
        .add(new Transaction(["bar"], "b"))
        .add(new Transaction(["baz"], "c"));
      const sum = batch.reduce(function(sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(3);
    });

    it("doesn't add action if last action with same path had same value", function() {
      const batch = this.batch
        .add(new Transaction(["foo", "bar"], "a"))
        .add(new Transaction(["foo", "foo"], "b"))
        .add(new Transaction(["foo", "bar"], "a"))
        .add(new Transaction(["foo", "bar"], "a"));
      const sum = batch.reduce(function(sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(3);
    });

    it("should keep all ", function() {
      const batch = this.batch
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
