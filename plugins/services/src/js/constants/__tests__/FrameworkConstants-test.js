const FrameworkConstants = require("../FrameworkConstants");

describe("FrameworkConstants", function() {
  describe("regexp", function() {
    var regexp = FrameworkConstants.FRAMEWORK_RESOURCE_ID_REGEXP;

    it("validates service name", function() {
      expect(regexp.test("dcos:adminrouter:service:marathon")).toBeTruthy();
    });

    it("validates service with dashes", function() {
      expect(
        regexp.test("dcos:adminrouter:service:marathon-user")
      ).toBeTruthy();
    });

    it("fails with invalid service id", function() {
      expect(regexp.test("dcos:adminrouter:service:marathon/user")).toBeFalsy();
    });

    it("fails with invalid resource id", function() {
      expect(regexp.test("dcos:service:marathon:foo/bar")).toBeFalsy();
    });
  });
});
