jest.dontMock("objektiv");
jest.dontMock("../DataValidatorUtil");

const DataValidatorUtil = require("../DataValidatorUtil");

describe("DataValidatorUtil", function() {
  describe("#errorArrayToMap", function() {
    it("should correctly return an object", function() {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: ["a", "b"], message: "Foo" }
      ]);
      expect(obj).toEqual({ a: { b: "Foo" } });
    });

    it("should correctly merge paths that share the same base", function() {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: ["a", "b"], message: "Foo" },
        { path: ["a", "c"], message: "Bar" }
      ]);
      expect(obj).toEqual({ a: { b: "Foo", c: "Bar" } });
    });

    it("should correctly create arrays when numbers in path", function() {
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

    it("should correctly merge errors in the same path", function() {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: ["a", "b"], message: "Foo" },
        { path: ["a", "b"], message: "Bar" }
      ]);
      expect(obj).toEqual({ a: { b: "Foo, Bar" } });
    });

    it("should correctly handle errors with empty paths", function() {
      var obj = DataValidatorUtil.errorArrayToMap([
        { path: [], message: "Foo" },
        { path: ["a", "b"], message: "Bar" }
      ]);
      expect(obj).toEqual({ a: { b: "Bar" } });
    });
  });

  describe("#updateOnlyOnPath", function() {
    it("should not touch errors on unknown paths", function() {
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

    it("should correctly update only related errors", function() {
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

    it("should remove errors if new list contains less, unrelated errors", function() {
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

  describe("#stripErrorsOnPath", function() {
    it("should remove only related errors", function() {
      var oldErrors = [
        { path: ["a", "b"], message: "Error1" },
        { path: ["a", "c"], message: "Error3" }
      ];
      var obj = DataValidatorUtil.stripErrorsOnPath(oldErrors, ["a", "b"]);
      expect(obj).toEqual([{ path: ["a", "c"], message: "Error3" }]);
    });
  });
});
