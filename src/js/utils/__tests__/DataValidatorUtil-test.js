const DataValidatorUtil = require("../DataValidatorUtil");

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

  describe("#updateOnlyOnPath", () => {
    it("does not touch errors on unknown paths", () => {
      var oldErrors = [
        { path: ["a", "b"], message: "Error1" },
        { path: ["a", "c"], message: "Error2" }
      ];
      var newErrors = [
        { path: ["a", "b"], message: "Error3" },
        { path: ["a", "c"], message: "Error4" }
      ];
      var obj = DataValidatorUtil.updateOnlyOnPath(oldErrors, newErrors, [
        "a",
        "d"
      ]);
      expect(obj).toEqual([
        { path: ["a", "b"], message: "Error1" },
        { path: ["a", "c"], message: "Error2" }
      ]);
    });

    it("updates only related errors", () => {
      var oldErrors = [
        { path: ["a", "b"], message: "Error1" },
        { path: ["a", "c"], message: "Error2" }
      ];
      var newErrors = [
        { path: ["a", "b"], message: "Error3" },
        { path: ["a", "c"], message: "Error4" }
      ];
      var obj = DataValidatorUtil.updateOnlyOnPath(oldErrors, newErrors, [
        "a",
        "b"
      ]);
      expect(obj).toEqual([
        { path: ["a", "c"], message: "Error2" },
        { path: ["a", "b"], message: "Error3" }
      ]);
    });

    it("removes errors if new list contains less, unrelated errors", () => {
      var oldErrors = [
        { path: ["a", "b"], message: "Error1" },
        { path: ["a", "c"], message: "Error3" }
      ];
      var newErrors = [{ path: ["a", "b"], message: "Error2" }];
      var obj = DataValidatorUtil.updateOnlyOnPath(oldErrors, newErrors, [
        "a",
        "b"
      ]);
      expect(obj).toEqual([{ path: ["a", "b"], message: "Error2" }]);
    });
  });

  describe("#stripErrorsOnPath", () => {
    it("removes only related errors", () => {
      var oldErrors = [
        { path: ["a", "b"], message: "Error1" },
        { path: ["a", "c"], message: "Error3" }
      ];
      var obj = DataValidatorUtil.stripErrorsOnPath(oldErrors, ["a", "b"]);
      expect(obj).toEqual([{ path: ["a", "c"], message: "Error3" }]);
    });
  });
});
