import HostUtil from "../HostUtil";

describe("HostUtil", () => {
  describe("#stringToHostname", () => {
    it("omits dots at the start", () => {
      const result = HostUtil.stringToHostname(".fdgsf.4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("omits dots at the end", () => {
      const result = HostUtil.stringToHostname("fdgsf.4abc123.");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("omits duplicated dots", () => {
      const result = HostUtil.stringToHostname("fdgsf..4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("does not replace dots midway", () => {
      const result = HostUtil.stringToHostname("fdgsf.4abc123");

      expect(result).toEqual("fdgsf.4abc123");
    });

    it("allows 63 char labels", () => {
      const hostname = [
        "010203040506070809010111213141516171819202122232425262728293031",
        "010203040506070809010111213141516171819202122232425262728293031"
      ].join(".");

      expect(HostUtil.stringToHostname(hostname)).toEqual(hostname);
    });

    it("does not alter valid strings", () => {
      const result = HostUtil.stringToHostname("0-0");

      expect(result).toEqual("0-0");
    });
  });

  describe("#stringToLabel", () => {
    it("strips invalid chars", () => {
      const result = HostUtil.stringToLabel("fd%gsf---gs7-f$gs--d7fddg-123");

      expect(result).toEqual("fdgsf---gs7-fgs--d7fddg-123");
    });

    it("replaces underscores", () => {
      const result = HostUtil.stringToLabel("fdgsf_4abc123");

      expect(result).toEqual("fdgsf-4abc123");
    });

    it("omits slashes", () => {
      const result = HostUtil.stringToLabel("fdgsf/4abc123");

      expect(result).toEqual("fdgsf4abc123");
    });

    it("omits dots", () => {
      const result = HostUtil.stringToLabel(".fdgsf.4abc123.");

      expect(result).toEqual("fdgsf4abc123");
    });

    it("strips invalid chars from the start", () => {
      const result = HostUtil.stringToLabel("-@4abc123");

      expect(result).toEqual("4abc123");
    });

    it("strips invalid chars from the end", () => {
      const result = HostUtil.stringToLabel("4abc123-");

      expect(result).toEqual("4abc123");
    });

    it("strips invalid chars from the start and end", () => {
      const result = HostUtil.stringToLabel(
        "##fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789-"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789"
      );
    });

    it("allows dashes within the hostname", () => {
      const result = HostUtil.stringToLabel("89fdgsf---gs7-fgs--d7fddg-123");

      expect(result).toEqual("89fdgsf---gs7-fgs--d7fddg-123");
    });

    it("strips invalid chars and trim string to 63 chars", () => {
      const result = HostUtil.stringToLabel(
        "fd%gsf---gs7-f$gs--d7fddg123456789012345678901234567890123456789-123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("trims string to 63 chars", () => {
      const result = HostUtil.stringToLabel(
        "0102030405060708090101112131415161718192021222324252627282930313233"
      );

      expect(result).toEqual(
        "010203040506070809010111213141516171819202122232425262728293031"
      );
    });

    it("strips invalid chars from start and trim string", () => {
      const result = HostUtil.stringToLabel(
        "%%fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789---123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("strips dashes from the end and trim string", () => {
      const result = HostUtil.stringToLabel(
        "%%fdgsf---gs7-fgs--d7fddg123456789012345678901234567890123456789---123"
      );

      expect(result).toEqual(
        "fdgsf---gs7-fgs--d7fddg1234567890123456789012345678901234567891"
      );
    });

    it("strips all dashes that exceed the char limit", () => {
      const result = HostUtil.stringToLabel(
        "a--------------------------------------------------------------------b"
      );

      expect(result).toEqual("ab");
    });

    it("does not alter valid hostnames", () => {
      const result = HostUtil.stringToLabel(
        "a-----------------------------------------------b"
      );

      expect(result).toEqual(
        "a-----------------------------------------------b"
      );
    });

    it("returns lowercase string", () => {
      const result = HostUtil.stringToLabel("XYZ");

      expect(result).toEqual("xyz");
    });
  });
});
