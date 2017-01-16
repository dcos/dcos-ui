jest.dontMock('../HostUtil');

const HostUtil = require('../HostUtil');

describe('HostUtil', function () {

  describe('#stringToHostname', function () {

    it('should strip out invalid characters from the middle', function () {
      const result = HostUtil.stringToHostname('fd%gsf---gs7-f$gs--d7fddg-123');

      expect(result).toEqual('fdgsf---gs7-fgs--d7fddg-123');
    });

    it('should strip out invalid characters from the start', function () {
      const result = HostUtil.stringToHostname('-@4abc123');

      expect(result).toEqual('4abc123');
    });

    it('should strip out invalid characters from the end', function () {
      const result = HostUtil.stringToHostname('4abc123.');

      expect(result).toEqual('4abc123');
    });

    it('should strip invalid characters from the start and end', function () {
      const result = HostUtil.stringToHostname('##fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789-');

      expect(result).toEqual('fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789');
    });

    it('should return valid hostnames', function () {
      const result = HostUtil.stringToHostname('0-0');

      expect(result).toEqual('0-0');
    });

    it('should allow dashes within the hostname', function () {
      const result = HostUtil.stringToHostname('89fdgsf---gs7-fgs--d7fddg-123');

      expect(result).toEqual('89fdgsf---gs7-fgs--d7fddg-123');
    });

    it('should strip invalid characters and trim to 63 characters and remove invalid end characters', function () {
      const result = HostUtil.stringToHostname('fd%gsf---gs7-f$gs--d7fddg123456789012345678901234567890123456789-123');

      expect(result).toEqual('fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891');
    });

    it('should strip invalid start characters and trim to 63 characters and remove invalid end characters', function () {
      const result = HostUtil.stringToHostname('%%fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789---123');

      expect(result).toEqual('fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891');
    });

    it('should return valid strings', function () {
      const result = HostUtil.stringToHostname('a--------------------------------------------------------------b');

      expect(result).toEqual('a-------------------------------------------------------------b');
    });

    it('should lowercase the string', function () {
      const result = HostUtil.stringToHostname('XYZ');

      expect(result).toEqual('xyz');
    });

  });

});
