import NetworkValidatorUtil from "../NetworkValidatorUtil";

describe("NetworkValidatorUtil", () => {
  describe("#isValidPort", () => {
    it("handles empty strings", () => {
      expect(NetworkValidatorUtil.isValidPort("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(NetworkValidatorUtil.isValidPort()).toBe(false);
    });

    it("handles wrong value types", () => {
      expect(NetworkValidatorUtil.isValidPort("not a number 666")).toBe(false);
      expect(NetworkValidatorUtil.isValidPort("80.80")).toBe(false);
      expect(NetworkValidatorUtil.isValidPort("1.1")).toBe(false);
    });

    it("handles number like inputs", () => {
      expect(NetworkValidatorUtil.isValidPort(0)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort("0")).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(80)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort("80")).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(8080)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort("8080")).toBe(true);
    });

    it("verifies that port is greater or equal to 0", () => {
      expect(NetworkValidatorUtil.isValidPort(-1)).toBe(false);
      expect(NetworkValidatorUtil.isValidPort(0)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(8080)).toBe(true);
    });

    it("verifies that port is smaller  or equal to 65535", () => {
      expect(NetworkValidatorUtil.isValidPort(8080)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(65535)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(65536)).toBe(false);
    });

    it("verifies that port 0 is valid", () => {
      expect(NetworkValidatorUtil.isValidPort(0)).toBe(true);
    });
  });
});
