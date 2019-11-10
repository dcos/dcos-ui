const JSONEditorUtil = require("../JSONEditorUtil");

describe("JSONEditorUtil", () => {
  describe("#cursorFromOffset", () => {
    it("resolves beginning edge", () => {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(0, text)).toEqual({
        row: 0,
        column: 0
      });
    });

    it("resolves ending edge", () => {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(16, text)).toEqual({
        row: 0,
        column: 16
      });
    });

    it("ignores negative offsets", () => {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(-1, text)).toEqual({
        row: 0,
        column: 0
      });
    });

    it("ignores offsets exceeding string length", () => {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(20, text)).toEqual({
        row: 0,
        column: 17
      });
    });

    it("resolves offset in multiline text", () => {
      const text = "first line\nsecond line\nthird line";
      expect(JSONEditorUtil.cursorFromOffset(13, text)).toEqual({
        row: 1,
        column: 2
      });
    });
  });

  describe("#deepObjectDiff", () => {
    it("detects added values", () => {
      const a = {};
      const b = { a: "foo" };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: "foo", previous: undefined },
        { path: [], value: { a: "foo" }, previous: {} }
      ]);
    });

    it("detects removed values", () => {
      const a = { a: "foo" };
      const b = {};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: undefined, previous: "foo" },
        { path: [], value: {}, previous: { a: "foo" } }
      ]);
    });

    it("detects modified values", () => {
      const a = { a: "foo" };
      const b = { a: "bar" };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: "bar", previous: "foo" },
        { path: [], value: { a: "bar" }, previous: { a: "foo" } }
      ]);
    });

    it("detects added values in arrays", () => {
      const a = { a: [] };
      const b = { a: ["foo"] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: "foo", previous: undefined },
        { path: ["a"], value: ["foo"], previous: [] },
        { path: [], value: { a: ["foo"] }, previous: { a: [] } }
      ]);
    });

    it("detects removed values in arrays", () => {
      const a = { a: ["foo"] };
      const b = { a: [] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: undefined, previous: "foo" },
        { path: ["a"], value: [], previous: ["foo"] },
        { path: [], value: { a: [] }, previous: { a: ["foo"] } }
      ]);
    });

    it("detects modified values in arrays", () => {
      const a = { a: ["foo"] };
      const b = { a: ["bar"] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: "bar", previous: "foo" },
        { path: ["a"], value: ["bar"], previous: ["foo"] },
        { path: [], value: { a: ["bar"] }, previous: { a: ["foo"] } }
      ]);
    });

    it("detects added values in objects", () => {
      const a = { a: {} };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: "foo", previous: undefined },
        { path: ["a"], value: { b: "foo" }, previous: {} },
        { path: [], value: { a: { b: "foo" } }, previous: { a: {} } }
      ]);
    });

    it("detects removed values in objects", () => {
      const a = { a: { b: "foo" } };
      const b = { a: {} };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: undefined, previous: "foo" },
        { path: ["a"], value: {}, previous: { b: "foo" } },
        { path: [], value: { a: {} }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("detects modified values in objects", () => {
      const a = { a: { b: "foo" } };
      const b = { a: { b: "bar" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: "bar", previous: "foo" },
        { path: ["a"], value: { b: "bar" }, previous: { b: "foo" } },
        { path: [], value: { a: { b: "bar" } }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("handles object-to-array mutations", () => {
      const a = { a: { b: "foo" } };
      const b = { a: ["foo"] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: undefined, previous: "foo" },
        { path: ["a", "0"], value: "foo", previous: undefined },
        { path: ["a"], value: ["foo"], previous: { b: "foo" } },
        { path: [], value: { a: ["foo"] }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("handles object-to-scalar mutations", () => {
      const a = { a: { b: "foo" } };
      const b = { a: "bar" };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: "bar", previous: { b: "foo" } },
        { path: [], value: { a: "bar" }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("handles array-to-object mutations", () => {
      const a = { a: ["foo"] };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: undefined, previous: "foo" },
        { path: ["a", "b"], value: "foo", previous: undefined },
        { path: ["a"], value: { b: "foo" }, previous: ["foo"] },
        { path: [], value: { a: { b: "foo" } }, previous: { a: ["foo"] } }
      ]);
    });

    it("handles scalar-to-object mutations", () => {
      const a = { a: "bar" };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: { b: "foo" }, previous: "bar" },
        { path: [], value: { a: { b: "foo" } }, previous: { a: "bar" } }
      ]);
    });

    it("handles null-to-object mutations", () => {
      const a = { a: null };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: { b: "foo" }, previous: null },
        { path: [], value: { a: { b: "foo" } }, previous: { a: null } }
      ]);
    });

    it("handles object-to-null mutations", () => {
      const a = { a: { b: "foo" } };
      const b = { a: null };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: null, previous: { b: "foo" } },
        { path: [], value: { a: null }, previous: { a: { b: "foo" } } }
      ]);
    });
  });

  describe("#sortObjectKeys", () => {
    it("orders keys according to old ones", () => {
      const a = { a: 0, b: 1, c: 2 };
      const b = { c: 3, a: 4, b: 5 };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(["a", "b", "c"]);
      expect(value).toEqual({ a: 4, b: 5, c: 3 });
    });

    it("orders less than previous keys in the same order", () => {
      const a = { a: 0, b: 1, c: 2 };
      const b = { c: 3, a: 4 };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(["a", "c"]);
      expect(value).toEqual({ a: 4, c: 3 });
    });

    it("adds new keys at the end of the object", () => {
      const a = { a: 0, b: 1, c: 2 };
      const b = { c: 3, a: 4, d: 5 };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(["a", "c", "d"]);
      expect(value).toEqual({ a: 4, c: 3, d: 5 });
    });

    it("orders keys according to old ones (nested)", () => {
      const a = { o: { a: 0, b: 1, c: 2 } };
      const b = { o: { c: 3, a: 4, b: 5 } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(["a", "b", "c"]);
      expect(value).toEqual({ o: { a: 4, b: 5, c: 3 } });
    });

    it("orders less than previous keys in the same order (nested)", () => {
      const a = { o: { a: 0, b: 1, c: 2 } };
      const b = { o: { c: 3, a: 4 } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(["a", "c"]);
      expect(value).toEqual({ o: { a: 4, c: 3 } });
    });

    it("adds new keys at the end of the object (nested)", () => {
      const a = { o: { a: 0, b: 1, c: 2 } };
      const b = { o: { c: 3, a: 4, d: 5 } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(["a", "c", "d"]);
      expect(value).toEqual({ o: { a: 4, c: 3, d: 5 } });
    });

    it("does not reorder arrays", () => {
      const a = { a: ["a", "b", "c"] };
      const b = { a: ["b", "a", "c"] };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({ a: ["b", "a", "c"] });
    });

    it("handles null-to-object comparisons", () => {
      const a = { a: { b: "foo", c: "bar" } };
      const b = { a: null };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({ a: null });
    });

    it("places object values in keys that were null before", () => {
      const a = { a: null };
      const b = { a: { b: "foo", c: "bar" } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({ a: { b: "foo", c: "bar" } });
    });
  });
});
