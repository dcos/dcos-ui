import ServiceValidatorUtil from "../ServiceValidatorUtil";

describe("ServiceValidatorUtil", function() {
  describe("#isValidServiceID", function() {
    it("handles empty strings", function() {
      expect(ServiceValidatorUtil.isValidServiceID("")).toBe(false);
    });

    it("handles undefined values", function() {
      expect(ServiceValidatorUtil.isValidServiceID()).toBe(false);
    });

    it("handles white spaces", function() {
      expect(ServiceValidatorUtil.isValidServiceID("white space")).toBe(false);
    });

    it("handles illegal characters", function() {
      expect(ServiceValidatorUtil.isValidServiceID("Uppercase")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app#1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app_1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app%1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app+1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app*1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app(1)")).toBe(false);
    });

    it("handles multiple forward slashes", function() {
      expect(ServiceValidatorUtil.isValidServiceID("/app//id////")).toBe(false);
    });

    it("verifies that the IDs don't begin with or end with a dash", function() {
      expect(ServiceValidatorUtil.isValidServiceID("-a/b/c")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a/b/c-")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a-b/c")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("a/b-c")).toBe(true);
    });

    it("verifies that the IDs don't begin with or end with a dot", function() {
      expect(ServiceValidatorUtil.isValidServiceID(".a/b/c")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a/b/c.")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a.b/c")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("a/b.c")).toBe(true);
    });

    it("verifies that the IDs are well-formed", function() {
      expect(ServiceValidatorUtil.isValidServiceID("app.1")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("/app.1")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("app.1/app-2")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("./app-1")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("../app-1")).toBe(true);
    });
  });
});
