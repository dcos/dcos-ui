import Units from "../Units";

let thisBaseSize;

describe("Units", () => {
  describe("#formatResource", () => {
    it("formats cpus", () => {
      const value = Units.formatResource("cpus", 3.4);
      expect(value).toEqual(3.4);
    });

    it("rounds values", () => {
      const value = Units.formatResource("cpus", 3.405);
      expect(value).toEqual(3.41);
    });

    it("formats mem", () => {
      const value = Units.formatResource("mem", 3.4);
      expect(value).toEqual("3.4 MiB");
    });

    it("formats disk", () => {
      const value = Units.formatResource("disk", 3481.6);
      expect(value).toEqual("3.4 GiB");
    });

    it("formats gpus", () => {
      const value = Units.formatResource("gpus", 4.3);
      expect(value).toEqual(4.3);
    });

    it("rounds gpus values", () => {
      const value = Units.formatResource("gpus", 3.405);
      expect(value).toEqual(3.41);
    });

    it("returns default for undefined mem", () => {
      const value = Units.formatResource("mem", undefined);
      expect(value).toEqual("0 B");
    });

    it("returns default for undefined gpu", () => {
      const value = Units.formatResource("gpus", undefined);
      expect(value).toEqual(0);
    });
  });

  describe("#filesize", () => {
    beforeEach(() => {
      thisBaseSize = 796;
    });

    // Regular tests
    it("converts to correct unit of B", () => {
      expect(Units.filesize(thisBaseSize)).toBe("796 B");
    });

    it("converts to correct unit of KiB", () => {
      expect(Units.filesize(thisBaseSize * 1024)).toBe("796 KiB");
    });

    it("converts to correct unit of MiB", () => {
      const factorize = Math.pow(1024, 2);
      expect(Units.filesize(thisBaseSize * factorize)).toBe("796 MiB");
    });

    it("converts to correct unit of GiB", () => {
      const factorize = Math.pow(1024, 3);
      expect(Units.filesize(thisBaseSize * factorize)).toBe("796 GiB");
    });

    it("converts to correct unit of PiB", () => {
      const factorize = Math.pow(1024, 5);
      expect(Units.filesize(thisBaseSize * factorize)).toBe("796 PiB");
    });

    it("converts to correct unit of large PiB", () => {
      const factorize = Math.pow(1024, 6);
      expect(Units.filesize(thisBaseSize * factorize)).toBe("815104 PiB");
    });

    it("converts to correct unit of MiB", () => {
      expect(Units.filesize((thisBaseSize + 108) * 1024)).toBe("0.88 MiB");
    });

    it("converts to correct unit of GiB", () => {
      const factorize = Math.pow(1024, 2);
      expect(Units.filesize((thisBaseSize + 128) * factorize)).toBe("0.9 GiB");
    });

    it("converts to correct unit of TiB", () => {
      const factorize = Math.pow(1024, 3);
      expect(Units.filesize((thisBaseSize + 158) * factorize)).toBe("0.93 TiB");
    });

    it("converts to correct unit of PiB", () => {
      const factorize = Math.pow(1024, 5);
      expect(Units.filesize((thisBaseSize + 230) * factorize)).toBe("1026 PiB");
    });

    // Special tests
    it("returns '0 B' for vales of zero", () => {
      expect(Units.filesize(0, 0)).toBe("0 B");
    });

    it("does not show decimals if set to 0", () => {
      const size = (thisBaseSize + 352) * 1024;
      const filesize = Units.filesize(size, 0, 1024);
      expect(filesize).toBe("1 MiB");
    });

    it("trims trailing zeroes from the mantissa", () => {
      const size = (thisBaseSize + 102) * 1024;
      const filesize = Units.filesize(size, 4);
      expect(filesize).toBe("0.877 MiB");
    });

    it("shows decimals places to the specified accuracy", () => {
      const size = (thisBaseSize + 116) * 1024;
      const filesize = Units.filesize(size, 4);
      expect(filesize).toBe("0.8906 MiB");
    });

    it("has correct custom unit and threshold", () => {
      const size = (thisBaseSize + 24) * 1024 * 1024;
      const filesize = Units.filesize(size, 2, 500, 1024, [
        "byte",
        "KB",
        "MB",
        "GB"
      ]);
      expect(filesize).toBe("0.8 GB");
    });

    it("has correct amount of 0 digits", () => {
      const size = 1000 * 1024;
      const filesize = Units.filesize(size, 2, 1024);
      expect(filesize).toBe("1000 KiB");
    });
  });

  describe("#contractNumber", () => {
    it("formats 999,999,999,999,999 correctly ", () =>
      expect(Units.contractNumber(999999999999999)).toEqual("> 999T"));

    it("formats 15,000,000,000 correctly", () =>
      expect(Units.contractNumber(15000000000)).toEqual("15B"));

    it("formats 15,555,555,555 correctly", () =>
      expect(Units.contractNumber(15555555555)).toEqual("16B"));

    it("formats 9,700,000,000 correctly ", () =>
      expect(Units.contractNumber(9700000000)).toEqual("10B"));

    it("formats 1,000,000,000 correctly ", () =>
      expect(Units.contractNumber(1000000000)).toEqual("1B"));

    it("formats 999,999,999 correctly ", () =>
      expect(Units.contractNumber(999999999)).toEqual("1B"));

    it("formats 999,000,000 correctly ", () =>
      expect(Units.contractNumber(999000000)).toEqual("999M"));

    it("formats 700,000,000 correctly ", () =>
      expect(Units.contractNumber(700000000)).toEqual("700M"));

    it("formats 15,000,000 correctly", () =>
      expect(Units.contractNumber(15000000)).toEqual("15M"));

    it("formats 15,555,555 correctly", () =>
      expect(Units.contractNumber(15555555)).toEqual("16M"));

    it("formats 1,500,000 correctly", () =>
      expect(Units.contractNumber(1500000)).toEqual("1.5M"));

    it("formats 1,555,555 correctly", () =>
      expect(Units.contractNumber(1555555)).toEqual("1.6M"));

    it("formats 998,000 correctly ", () =>
      expect(Units.contractNumber(998000)).toEqual("998K"));

    it("formats 15,000 correctly", () =>
      expect(Units.contractNumber(15000)).toEqual("15K"));

    it("formats 15,555 correctly", () =>
      expect(Units.contractNumber(15555)).toEqual("16K"));

    it("formats 5,500 correctly", () =>
      expect(Units.contractNumber(5500)).toEqual("5.5K"));

    it("formats 5,555 correctly", () =>
      expect(Units.contractNumber(5555)).toEqual("5.6K"));

    it("formats 1,900 correctly ", () =>
      expect(Units.contractNumber(1900)).toEqual("1900"));

    it("formats 999 correctly ", () =>
      expect(Units.contractNumber(999)).toEqual("999"));

    it("formats 10 correctly ", () =>
      expect(Units.contractNumber(10)).toEqual("10"));

    it("formats small 1.123456 correctly ", () => {
      expect(Units.contractNumber(1.123456)).toEqual("1.12");

      return expect(
        Units.contractNumber(1.123456, {
          decimalPlaces: 4
        })
      ).toEqual("1.1235");
    });

    it("doesn't mess with fractions (TODO revise)", () => {
      expect(Units.contractNumber(0.123456)).toEqual("0.123456");

      return expect(
        Units.contractNumber(0.123456, {
          decimalPlaces: 4
        })
      ).toEqual("0.123456");
    });

    it("doesn't mess with small whole numbers", () => {
      expect(Units.contractNumber(1)).toEqual("1");

      return expect(
        Units.contractNumber(1, {
          decimalPlaces: 4
        })
      ).toEqual("1");
    });

    it("forces the default fixed precision when forceFixedPrecision is true", () =>
      expect(
        Units.contractNumber(0.123456, { forceFixedPrecision: true })
      ).toEqual("0.12"));

    it("forces a defined precision when forceFixedPrecision is true", () =>
      expect(
        Units.contractNumber(0.123456, {
          forceFixedPrecision: true,
          decimalPlaces: 3
        })
      ).toEqual("0.123"));

    it("returns a string given an input string", () =>
      expect(Units.contractNumber("foobar")).toEqual("foobar"));

    return it('returns "undefined" given no input', () =>
      expect(Units.contractNumber()).toEqual(undefined));
  });
});
