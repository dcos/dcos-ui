jest.dontMock("../HostUtil");

const HostUtil = require("../HostUtil");

describe("HostUtil", function() {
  describe("#stringToHostname", function() {
    it("should omit dots at the start", function() {
      const result = HostUtil.stringToHostname(".fdgsf.4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("should omit dots at the end", function() {
      const result = HostUtil.stringToHostname("fdgsf.4abc123.");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("should omit duplicated dots", function() {
      const result = HostUtil.stringToHostname("fdgsf..4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("should not replace dots midway", function() {
      const result = HostUtil.stringToHostname("fdgsf.4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("should allow 63 char labels", function() {
      const hostname = [
        "010203040506070809010111213141516171819202122232425262728293031",
        "010203040506070809010111213141516171819202122232425262728293031"
      ].join(".");

      expect(HostUtil.stringToHostname(hostname)).toEqual(hostname);
    });

    it("should not alter valid strings", function() {
      const result = HostUtil.stringToHostname("0-0");

      expect(result).toEqual("0-0");
    });
  });

  describe("#stringToLabel", function() {
    it("should strip invalid chars", function() {
      const result = HostUtil.stringToLabel("fd%gsf---gs7-f$gs--d7fddg-123");

      expect(result).toEqual("fdgsf---gs7-fgs--d7fddg-123");
    });

    it("should replace underscores", function() {
      const result = HostUtil.stringToLabel("fdgsf_4abc123");

      expect(result).toEqual("fdgsf-4abc123");
    });

    it("should omit slashes", function() {
      const result = HostUtil.stringToLabel("fdgsf/4abc123");

      expect(result).toEqual("fdgsf4abc123");
    });

    it("should omit dots", function() {
      const result = HostUtil.stringToLabel(".fdgsf.4abc123.");

      expect(result).toEqual("fdgsf4abc123");
    });

    it("should strip invalid chars from the start", function() {
      const result = HostUtil.stringToLabel("-@4abc123");

      expect(result).toEqual("4abc123");
    });

    it("should strip invalid chars from the end", function() {
      const result = HostUtil.stringToLabel("4abc123-");

      expect(result).toEqual("4abc123");
    });

    it("should strip invalid chars from the start and end", function() {
      const result = HostUtil.stringToLabel(
        "##fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789-"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789"
      );
    });

    it("should allow dashes within the hostname", function() {
      const result = HostUtil.stringToLabel("89fdgsf---gs7-fgs--d7fddg-123");

      expect(result).toEqual("89fdgsf---gs7-fgs--d7fddg-123");
    });

    it("should strip invalid chars and trim string to 63 chars", function() {
      const result = HostUtil.stringToLabel(
        "fd%gsf---gs7-f$gs--d7fddg123456789012345678901234567890123456789-123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("should trim string to 63 chars", function() {
      const result = HostUtil.stringToLabel(
        "0102030405060708090101112131415161718192021222324252627282930313233"
      );

      expect(result).toEqual(
        "010203040506070809010111213141516171819202122232425262728293031"
      );
    });

    it("should strip invalid chars from start and trim string", function() {
      const result = HostUtil.stringToLabel(
        "%%fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789---123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("should strip dashes from the end and trim string", function() {
      const result = HostUtil.stringToLabel(
        "%%fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789---123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("should strip all dashes that exceed the char limit", function() {
      const result = HostUtil.stringToLabel(
        "a--------------------------------------------------------------------b"
      );

      expect(result).toEqual("ab");
    });

    it("should not alter valid hostnames", function() {
      const result = HostUtil.stringToLabel(
        "a-----------------------------------------------b"
      );

      expect(result).toEqual(
        "a-----------------------------------------------b"
      );
    });

    it("should lowercase the string", function() {
      const result = HostUtil.stringToLabel("XYZ");

      expect(result).toEqual("xyz");
    });
  });
});
