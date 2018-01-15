const HostUtil = require("../HostUtil");

describe("HostUtil", function() {
  describe("#stringToHostname", function() {
    it("omits dots at the start", function() {
      const result = HostUtil.stringToHostname(".fdgsf.4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("omits dots at the end", function() {
      const result = HostUtil.stringToHostname("fdgsf.4abc123.");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("omits duplicated dots", function() {
      const result = HostUtil.stringToHostname("fdgsf..4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("does not replace dots midway", function() {
      const result = HostUtil.stringToHostname("fdgsf.4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("allows 63 char labels", function() {
      const hostname = [
        "010203040506070809010111213141516171819202122232425262728293031",
        "010203040506070809010111213141516171819202122232425262728293031"
      ].join(".");

      expect(HostUtil.stringToHostname(hostname)).toEqual(hostname);
    });

    it("does not alter valid strings", function() {
      const result = HostUtil.stringToHostname("0-0");

      expect(result).toEqual("0-0");
    });
  });

  describe("#stringToLabel", function() {
    it("strips invalid chars", function() {
      const result = HostUtil.stringToLabel("fd%gsf---gs7-f$gs--d7fddg-123");

      expect(result).toEqual("fdgsf---gs7-fgs--d7fddg-123");
    });

    it("replaces underscores", function() {
      const result = HostUtil.stringToLabel("fdgsf_4abc123");

      expect(result).toEqual("fdgsf-4abc123");
    });

    it("omits slashes", function() {
      const result = HostUtil.stringToLabel("fdgsf/4abc123");

      expect(result).toEqual("fdgsf4abc123");
    });

    it("omits dots", function() {
      const result = HostUtil.stringToLabel(".fdgsf.4abc123.");

      expect(result).toEqual("fdgsf4abc123");
    });

    it("strips invalid chars from the start", function() {
      const result = HostUtil.stringToLabel("-@4abc123");

      expect(result).toEqual("4abc123");
    });

    it("strips invalid chars from the end", function() {
      const result = HostUtil.stringToLabel("4abc123-");

      expect(result).toEqual("4abc123");
    });

    it("strips invalid chars from the start and end", function() {
      const result = HostUtil.stringToLabel(
        "##fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789-"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789"
      );
    });

    it("allows dashes within the hostname", function() {
      const result = HostUtil.stringToLabel("89fdgsf---gs7-fgs--d7fddg-123");

      expect(result).toEqual("89fdgsf---gs7-fgs--d7fddg-123");
    });

    it("strips invalid chars and trim string to 63 chars", function() {
      const result = HostUtil.stringToLabel(
        "fd%gsf---gs7-f$gs--d7fddg123456789012345678901234567890123456789-123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("trims string to 63 chars", function() {
      const result = HostUtil.stringToLabel(
        "0102030405060708090101112131415161718192021222324252627282930313233"
      );

      expect(result).toEqual(
        "010203040506070809010111213141516171819202122232425262728293031"
      );
    });

    it("strips invalid chars from start and trim string", function() {
      const result = HostUtil.stringToLabel(
        "%%fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789---123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("strips dashes from the end and trim string", function() {
      const result = HostUtil.stringToLabel(
        "%%fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789---123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("strips all dashes that exceed the char limit", function() {
      const result = HostUtil.stringToLabel(
        "a--------------------------------------------------------------------b"
      );

      expect(result).toEqual("ab");
    });

    it("does not alter valid hostnames", function() {
      const result = HostUtil.stringToLabel(
        "a-----------------------------------------------b"
      );

      expect(result).toEqual(
        "a-----------------------------------------------b"
      );
    });

    it("returns lowercase string", function() {
      const result = HostUtil.stringToLabel("XYZ");

      expect(result).toEqual("xyz");
    });
  });
});
