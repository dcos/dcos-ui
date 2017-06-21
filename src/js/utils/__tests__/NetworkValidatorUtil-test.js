jest.dontMock("../NetworkValidatorUtil");

const NetworkValidatorUtil = require("../NetworkValidatorUtil");

describe("NetworkValidatorUtil", function() {
  describe("#isValidPort", function() {
    it("should properly handle empty strings", function() {
      expect(NetworkValidatorUtil.isValidPort("")).toBe(false);
    });

    it("should properly handle undefined values", function() {
      expect(NetworkValidatorUtil.isValidPort()).toBe(false);
    });

    it("should properly handle wrong value types", function() {
      expect(NetworkValidatorUtil.isValidPort("not a number 666")).toBe(false);
      expect(NetworkValidatorUtil.isValidPort("80.80")).toBe(false);
      expect(NetworkValidatorUtil.isValidPort("1.1")).toBe(false);
    });

    it("should handle number like inputs", function() {
      expect(NetworkValidatorUtil.isValidPort(0)).toBe(false);
      expect(NetworkValidatorUtil.isValidPort("0")).toBe(false);
      expect(NetworkValidatorUtil.isValidPort(80)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort("80")).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(8080)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort("8080")).toBe(true);
    });

    it("should verify that port is greater then 0", function() {
      expect(NetworkValidatorUtil.isValidPort(-1)).toBe(false);
      expect(NetworkValidatorUtil.isValidPort(0)).toBe(false);
      expect(NetworkValidatorUtil.isValidPort(8080)).toBe(true);
    });

    it("should verify that port is smaller  or equal to 65535", function() {
      expect(NetworkValidatorUtil.isValidPort(8080)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(65535)).toBe(true);
      expect(NetworkValidatorUtil.isValidPort(65536)).toBe(false);
    });
  });
});
