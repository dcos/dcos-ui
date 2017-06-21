jest.dontMock("../ResourceValidatorUtil");

const ResourceValidatorUtil = require("../ResourceValidatorUtil");

describe("ResourceValidatorUtil", function() {
  describe("#isValidCPUSValue", function() {
    it("should properly handle empty strings", function() {
      expect(ResourceValidatorUtil.isValidCPUs("")).toBe(false);
    });

    it("should properly handle  undefined values", function() {
      expect(ResourceValidatorUtil.isValidCPUs()).toBe(false);
    });

    it("should properly handle wrong value types", function() {
      expect(ResourceValidatorUtil.isValidCPUs("not a number 666")).toBe(false);
    });

    it("should handle number like inputs", function() {
      expect(ResourceValidatorUtil.isValidCPUs(0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUs("0.0001")).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUs(0.01)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUs("0.01")).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUs(2)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUs("2")).toBe(true);
    });

    it("should verify that CPUs is greater or equal to 0.01", function() {
      expect(ResourceValidatorUtil.isValidCPUs(0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUs(0.01)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUs(5)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUs(2)).toBe(true);
    });
  });

  describe("#isValidDiskValue", function() {
    it("should properly handle empty strings", function() {
      expect(ResourceValidatorUtil.isValidDisk("")).toBe(false);
    });

    it("should properly handle undefined values", function() {
      expect(ResourceValidatorUtil.isValidDisk()).toBe(false);
    });

    it("should properly handle wrong value types", function() {
      expect(ResourceValidatorUtil.isValidDisk("not a number 666")).toBe(false);
    });

    it("should handle number like inputs", function() {
      expect(ResourceValidatorUtil.isValidDisk("-0.1")).toBe(false);
      expect(ResourceValidatorUtil.isValidDisk(-0.1)).toBe(false);
      expect(ResourceValidatorUtil.isValidDisk("0.1")).toBe(true);
      expect(ResourceValidatorUtil.isValidDisk(0.1)).toBe(true);
    });

    it("should verify that Disk is a positive number", function() {
      expect(ResourceValidatorUtil.isValidDisk(-1)).toBe(false);
      expect(ResourceValidatorUtil.isValidDisk(-0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidDisk(0.001)).toBe(true);
      expect(ResourceValidatorUtil.isValidDisk(1)).toBe(true);
    });
  });

  describe("#isValidMemoryValue", function() {
    it("should properly handle empty strings", function() {
      expect(ResourceValidatorUtil.isValidMemory("")).toBe(false);
    });

    it("should properly handle undefined values", function() {
      expect(ResourceValidatorUtil.isValidMemory()).toBe(false);
    });

    it("should properly handle wrong value types", function() {
      expect(ResourceValidatorUtil.isValidMemory("not a number 666")).toBe(
        false
      );
    });

    it("should handle number like inputs", function() {
      expect(ResourceValidatorUtil.isValidMemory(0.01)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemory("0.01")).toBe(false);
      expect(ResourceValidatorUtil.isValidMemory(32)).toBe(true);
      expect(ResourceValidatorUtil.isValidMemory("32")).toBe(true);
    });

    it("should verify that Memory is greater or equal to 32", function() {
      expect(ResourceValidatorUtil.isValidCPUs(0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUs(0.01)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUs(5)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUs(2)).toBe(true);
    });

    it("looks like a number greater or equal to 32", function() {
      expect(ResourceValidatorUtil.isValidMemory(0.0001)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemory(0.1)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemory(5)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemory(31)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemory(32)).toBe(true);
      expect(ResourceValidatorUtil.isValidMemory(32.7)).toBe(true);
      expect(ResourceValidatorUtil.isValidMemory(500)).toBe(true);
    });
  });
});
