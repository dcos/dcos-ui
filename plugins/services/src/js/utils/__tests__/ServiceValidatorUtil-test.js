import ServiceValidatorUtil from "../ServiceValidatorUtil";

describe("ServiceValidatorUtil", () => {
  describe("#isValidServiceID", () => {
    it("handles empty strings", () => {
      expect(ServiceValidatorUtil.isValidServiceID("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(ServiceValidatorUtil.isValidServiceID()).toBe(false);
    });

    it("handles white spaces", () => {
      expect(ServiceValidatorUtil.isValidServiceID("white space")).toBe(false);
    });

    it("handles illegal characters", () => {
      expect(ServiceValidatorUtil.isValidServiceID("Uppercase")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app#1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app_1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app%1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app+1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app*1")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("app(1)")).toBe(false);
    });

    it("handles multiple forward slashes", () => {
      expect(ServiceValidatorUtil.isValidServiceID("/app//id////")).toBe(false);
    });

    it("verifies that the IDs don't begin with or end with a dash", () => {
      expect(ServiceValidatorUtil.isValidServiceID("-a/b/c")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a/b/c-")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a-b/c")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("a/b-c")).toBe(true);
    });

    it("verifies that the IDs don't begin with or end with a dot", () => {
      expect(ServiceValidatorUtil.isValidServiceID(".a/b/c")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a/b/c.")).toBe(false);
      expect(ServiceValidatorUtil.isValidServiceID("a.b/c")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("a/b.c")).toBe(true);
    });

    it("verifies that the IDs are well-formed", () => {
      expect(ServiceValidatorUtil.isValidServiceID("app.1")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("/app.1")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("app.1/app-2")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("./app-1")).toBe(true);
      expect(ServiceValidatorUtil.isValidServiceID("../app-1")).toBe(true);
    });
  });
});
