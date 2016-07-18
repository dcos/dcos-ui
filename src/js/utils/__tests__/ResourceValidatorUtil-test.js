jest.dontMock('../ResourceValidatorUtil');

var ResourceValidatorUtil = require('../ResourceValidatorUtil');

describe('ResourceValidatorUtil', function () {

  describe('#isValidCPUSValue', function () {
    it('should properly handle empty strings', function () {
      expect(ResourceValidatorUtil.isValidCPUSValue('')).toBe(false);
    });

    it('should properly handle  undefined values', function () {
      expect(ResourceValidatorUtil.isValidCPUSValue()).toBe(false);
    });

    it('should properly handle wrong value types', function () {
      expect(ResourceValidatorUtil.isValidCPUSValue('not a number 666'))
        .toBe(false);
    });

    it('should handle number like inputs', function () {
      expect(ResourceValidatorUtil.isValidCPUSValue(0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUSValue('0.0001')).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUSValue(0.01)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUSValue('0.01')).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUSValue(2)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUSValue('2')).toBe(true);
    });

    it('should verify that CPUs is greater or equal to 0.01', function () {
      expect(ResourceValidatorUtil.isValidCPUSValue(0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUSValue(0.01)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUSValue(5)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUSValue(2)).toBe(true);
    });

  });

  describe('#isValidDiskValue', function () {
    it('should properly handle empty strings', function () {
      expect(ResourceValidatorUtil.isValidDiskValue('')).toBe(false);
    });

    it('should properly handle undefined values', function () {
      expect(ResourceValidatorUtil.isValidDiskValue()).toBe(false);
    });

    it('should properly handle wrong value types', function () {
      expect(ResourceValidatorUtil.isValidDiskValue('not a number 666'))
        .toBe(false);
    });

    it('should handle number like inputs', function () {
      expect(ResourceValidatorUtil.isValidDiskValue('-0.1')).toBe(false);
      expect(ResourceValidatorUtil.isValidDiskValue(-0.1)).toBe(false);
      expect(ResourceValidatorUtil.isValidDiskValue('0.1')).toBe(true);
      expect(ResourceValidatorUtil.isValidDiskValue(0.1)).toBe(true);
    });

    it('should verify that Disk is a positive number', function () {
      expect(ResourceValidatorUtil.isValidDiskValue(-1)).toBe(false);
      expect(ResourceValidatorUtil.isValidDiskValue(-0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidDiskValue(0.001)).toBe(true);
      expect(ResourceValidatorUtil.isValidDiskValue(1)).toBe(true);
    });
  });

  describe('#isValidMemoryValue', function () {
    it('should properly handle empty strings', function () {
      expect(ResourceValidatorUtil.isValidMemoryValue('')).toBe(false);
    });

    it('should properly handle undefined values', function () {
      expect(ResourceValidatorUtil.isValidMemoryValue()).toBe(false);
    });

    it('should properly handle wrong value types', function () {
      expect(ResourceValidatorUtil.isValidMemoryValue('not a number 666'))
        .toBe(false);
    });

    it('should handle number like inputs', function () {
      expect(ResourceValidatorUtil.isValidMemoryValue(0.01)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemoryValue('0.01')).toBe(false);
      expect(ResourceValidatorUtil.isValidMemoryValue(32)).toBe(true);
      expect(ResourceValidatorUtil.isValidMemoryValue('32')).toBe(true);
    });

    it('should verify that Memory is greater or equal to 32', function () {
      expect(ResourceValidatorUtil.isValidCPUSValue(0.001)).toBe(false);
      expect(ResourceValidatorUtil.isValidCPUSValue(0.01)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUSValue(5)).toBe(true);
      expect(ResourceValidatorUtil.isValidCPUSValue(2)).toBe(true);
    });

    it('looks like a number greater or equal to 32', function () {
      expect(ResourceValidatorUtil.isValidMemoryValue(0.0001)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemoryValue(0.1)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemoryValue(5)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemoryValue(31)).toBe(false);
      expect(ResourceValidatorUtil.isValidMemoryValue(32)).toBe(true);
      expect(ResourceValidatorUtil.isValidMemoryValue(32.7)).toBe(true);
      expect(ResourceValidatorUtil.isValidMemoryValue(500)).toBe(true);
    });
  });

});

