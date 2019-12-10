import DataValidatorUtil from "../DataValidatorUtil";

describe("DataValidatorUtil", () => {
  describe("#errorArrayToMap", () => {
    it("returns an object", () => {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: ["a", "b"], message: "Foo" }
      ]);
      expect(obj).toEqual({ a: { b: "Foo" } });
    });

    it("merges paths that share the same base", () => {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: ["a", "b"], message: "Foo" },
        { path: ["a", "c"], message: "Bar" }
      ]);
      expect(obj).toEqual({ a: { b: "Foo", c: "Bar" } });
    });

    it("creates arrays when numbers in path", () => {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: ["a", 0, "b"], message: "Foo" },
        { path: ["a", 5, "b"], message: "Bar" }
      ]);
      expect(obj).toEqual({
        a: [
          { b: "Foo" },
          undefined,
          undefined,
          undefined,
          undefined,
          { b: "Bar" }
        ]
      });
    });

    it("merges errors in the same path", () => {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: ["a", "b"], message: "Foo" },
        { path: ["a", "b"], message: "Bar" }
      ]);
      expect(obj).toEqual({ a: { b: "Foo, Bar" } });
    });

    it("handles errors with empty paths", () => {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: [], message: "Foo" },
        { path: ["a", "b"], message: "Bar" }
      ]);
      expect(obj).toEqual({ a: { b: "Bar" } });
    });
  });
});
