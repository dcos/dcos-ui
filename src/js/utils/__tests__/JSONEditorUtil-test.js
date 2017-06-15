jest.dontMock("../JSONEditorUtil");

const JSONEditorUtil = require("../JSONEditorUtil");

describe("JSONEditorUtil", function() {
  describe("#cursorFromOffset", function() {
    it("should properly resolve beginning edge", function() {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(0, text)).toEqual({
        row: 0,
        column: 0
      });
    });

    it("should properly resolve ending edge", function() {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(16, text)).toEqual({
        row: 0,
        column: 16
      });
    });

    it("should ignore negative offsets", function() {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(-1, text)).toEqual({
        row: 0,
        column: 0
      });
    });

    it("should ignore offsets exceeding string length", function() {
      const text = "some oneline text";
      expect(JSONEditorUtil.cursorFromOffset(20, text)).toEqual({
        row: 0,
        column: 17
      });
    });

    it("should properly resolve offset in multiline text", function() {
      const text = "first line\nsecond line\nthird line";
      expect(JSONEditorUtil.cursorFromOffset(13, text)).toEqual({
        row: 1,
        column: 2
      });
    });
  });

  describe("#deepObjectDiff", function() {
    it("should detect added values", function() {
      const a = {};
      const b = { a: "foo" };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: "foo", previous: undefined },
        { path: [], value: { a: "foo" }, previous: {} }
      ]);
    });

    it("should detect removed values", function() {
      const a = { a: "foo" };
      const b = {};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: undefined, previous: "foo" },
        { path: [], value: {}, previous: { a: "foo" } }
      ]);
    });

    it("should detect modified values", function() {
      const a = { a: "foo" };
      const b = { a: "bar" };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: "bar", previous: "foo" },
        { path: [], value: { a: "bar" }, previous: { a: "foo" } }
      ]);
    });

    it("should detect added values in arrays", function() {
      const a = { a: [] };
      const b = { a: ["foo"] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: "foo", previous: undefined },
        { path: ["a"], value: ["foo"], previous: [] },
        { path: [], value: { a: ["foo"] }, previous: { a: [] } }
      ]);
    });

    it("should detect removed values in arrays", function() {
      const a = { a: ["foo"] };
      const b = { a: [] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: undefined, previous: "foo" },
        { path: ["a"], value: [], previous: ["foo"] },
        { path: [], value: { a: [] }, previous: { a: ["foo"] } }
      ]);
    });

    it("should detect modified values in arrays", function() {
      const a = { a: ["foo"] };
      const b = { a: ["bar"] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: "bar", previous: "foo" },
        { path: ["a"], value: ["bar"], previous: ["foo"] },
        { path: [], value: { a: ["bar"] }, previous: { a: ["foo"] } }
      ]);
    });

    it("should detect added values in objects", function() {
      const a = { a: {} };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: "foo", previous: undefined },
        { path: ["a"], value: { b: "foo" }, previous: {} },
        { path: [], value: { a: { b: "foo" } }, previous: { a: {} } }
      ]);
    });

    it("should detect removed values in objects", function() {
      const a = { a: { b: "foo" } };
      const b = { a: {} };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: undefined, previous: "foo" },
        { path: ["a"], value: {}, previous: { b: "foo" } },
        { path: [], value: { a: {} }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("should detect modified values in objects", function() {
      const a = { a: { b: "foo" } };
      const b = { a: { b: "bar" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: "bar", previous: "foo" },
        { path: ["a"], value: { b: "bar" }, previous: { b: "foo" } },
        { path: [], value: { a: { b: "bar" } }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("should handle object-to-array mutations", function() {
      const a = { a: { b: "foo" } };
      const b = { a: ["foo"] };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "b"], value: undefined, previous: "foo" },
        { path: ["a", "0"], value: "foo", previous: undefined },
        { path: ["a"], value: ["foo"], previous: { b: "foo" } },
        { path: [], value: { a: ["foo"] }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("should handle object-to-scalar mutations", function() {
      const a = { a: { b: "foo" } };
      const b = { a: "bar" };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: "bar", previous: { b: "foo" } },
        { path: [], value: { a: "bar" }, previous: { a: { b: "foo" } } }
      ]);
    });

    it("should handle array-to-object mutations", function() {
      const a = { a: ["foo"] };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a", "0"], value: undefined, previous: "foo" },
        { path: ["a", "b"], value: "foo", previous: undefined },
        { path: ["a"], value: { b: "foo" }, previous: ["foo"] },
        { path: [], value: { a: { b: "foo" } }, previous: { a: ["foo"] } }
      ]);
    });

    it("should handle scalar-to-object mutations", function() {
      const a = { a: "bar" };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: { b: "foo" }, previous: "bar" },
        { path: [], value: { a: { b: "foo" } }, previous: { a: "bar" } }
      ]);
    });

    it("should handle null-to-object mutations", function() {
      const a = { a: null };
      const b = { a: { b: "foo" } };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: { b: "foo" }, previous: null },
        { path: [], value: { a: { b: "foo" } }, previous: { a: null } }
      ]);
    });

    it("should handle object-to-null mutations", function() {
      const a = { a: { b: "foo" } };
      const b = { a: null };

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        { path: ["a"], value: null, previous: { b: "foo" } },
        { path: [], value: { a: null }, previous: { a: { b: "foo" } } }
      ]);
    });
  });

  describe("#sortObjectKeys", function() {
    it("should order keys according to old ones", function() {
      const a = { a: 0, b: 1, c: 2 };
      const b = { c: 3, a: 4, b: 5 };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(["a", "b", "c"]);
      expect(value).toEqual({ a: 4, b: 5, c: 3 });
    });

    it("should order less than previous keys in the same order", function() {
      const a = { a: 0, b: 1, c: 2 };
      const b = { c: 3, a: 4 };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(["a", "c"]);
      expect(value).toEqual({ a: 4, c: 3 });
    });

    it("should add new keys at the end of the object", function() {
      const a = { a: 0, b: 1, c: 2 };
      const b = { c: 3, a: 4, d: 5 };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(["a", "c", "d"]);
      expect(value).toEqual({ a: 4, c: 3, d: 5 });
    });

    it("should order keys according to old ones (nested)", function() {
      const a = { o: { a: 0, b: 1, c: 2 } };
      const b = { o: { c: 3, a: 4, b: 5 } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(["a", "b", "c"]);
      expect(value).toEqual({ o: { a: 4, b: 5, c: 3 } });
    });

    it("should order less than previous keys in the same order (nested)", function() {
      const a = { o: { a: 0, b: 1, c: 2 } };
      const b = { o: { c: 3, a: 4 } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(["a", "c"]);
      expect(value).toEqual({ o: { a: 4, c: 3 } });
    });

    it("should add new keys at the end of the object (nested)", function() {
      const a = { o: { a: 0, b: 1, c: 2 } };
      const b = { o: { c: 3, a: 4, d: 5 } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(["a", "c", "d"]);
      expect(value).toEqual({ o: { a: 4, c: 3, d: 5 } });
    });

    it("does not reorder arrays", function() {
      const a = { a: ["a", "b", "c"] };
      const b = { a: ["b", "a", "c"] };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({ a: ["b", "a", "c"] });
    });

    it("should properly handle null-to-object comparisons", function() {
      const a = { a: { b: "foo", c: "bar" } };
      const b = { a: null };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({ a: null });
    });

    it("should place object values in keys that were null before", function() {
      const a = { a: null };
      const b = { a: { b: "foo", c: "bar" } };

      const value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({ a: { b: "foo", c: "bar" } });
    });
  });
});
