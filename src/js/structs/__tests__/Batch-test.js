import Transaction from "../Transaction";

import Batch from "../Batch";

let thisBatch;

describe("Batch", () => {
  beforeEach(() => {
    thisBatch = new Batch();
  });

  describe("#add", () => {
    it("does not throw an error", () => {
      expect(() => {
        thisBatch.add(new Transaction(["foo"], "test"));
      }).not.toThrow();
    });

    it("creates new batch instances", () => {
      const newBatch = thisBatch.add(new Transaction(["foo"], "test"));
      expect(newBatch).not.toBe(thisBatch);
    });
  });

  describe("#reduce", () => {
    it("iterates correctly over a batch with 1 item", () => {
      const batch = thisBatch.add(new Transaction(["foo"], "a"));
      const values = batch.reduce((values, item) => {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(["a"]);
    });

    it("iterates correctly over a batch with 3 item", () => {
      const batch = thisBatch
        .add(new Transaction(["foo"], "a"))
        .add(new Transaction(["bar"], "b"))
        .add(new Transaction(["baz"], "c"));
      const values = batch.reduce((values, item) => {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(["a", "b", "c"]);
    });

    it("runs reducers at least once", () => {
      const sum = thisBatch.reduce(sum => sum + 1, 0);

      expect(sum).toEqual(1);
    });

    it("passes sane arguments for reducing on empty batch", () => {
      const args = thisBatch.reduce(
        (sum, action, index) => [sum, action, index],
        "initial"
      );

      expect(args).toEqual(["initial", { path: [], value: "INIT" }, 0]);
    });

    it("does not run reducers more than number than values", () => {
      const batch = thisBatch
        .add(new Transaction(["foo"], "a"))
        .add(new Transaction(["bar"], "b"))
        .add(new Transaction(["baz"], "c"));
      const sum = batch.reduce(sum => sum + 1, 0);

      expect(sum).toEqual(3);
    });

    it("doesn't add action if last action with same path had same value", () => {
      const batch = thisBatch
        .add(new Transaction(["foo", "bar"], "a"))
        .add(new Transaction(["foo", "foo"], "b"))
        .add(new Transaction(["foo", "bar"], "a"))
        .add(new Transaction(["foo", "bar"], "a"));
      const sum = batch.reduce(sum => sum + 1, 0);

      expect(sum).toEqual(3);
    });

    it("keeps all ", () => {
      const batch = thisBatch
        .add(new Transaction(["id"], "a"))
        .add(new Transaction(["cpu"], 1))
        .add(new Transaction(["id"], "b"))
        .add(new Transaction(["mem"], 1))
        .add(new Transaction(["id"], "a"));
      const sum = batch.reduce(sum => sum + 1, 0);

      expect(sum).toEqual(5);
    });
  });
});
