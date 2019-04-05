import DateUtil from "../DateUtil";

describe("DateUtil", function() {
  describe("#msToMultiplicants", function() {
    it("decomposes milliseconds only", function() {
      var result = DateUtil.msToMultiplicants(987);

      expect(result).toEqual(["987 ms"]);
    });

    it("decomposes seconds only", function() {
      var result = DateUtil.msToMultiplicants(12000);

      expect(result).toEqual(["12 sec"]);
    });

    it("decomposes minutes only", function() {
      var result = DateUtil.msToMultiplicants(720000);

      expect(result).toEqual(["12 min"]);
    });

    it("decomposes hours only", function() {
      var result = DateUtil.msToMultiplicants(43200000);

      expect(result).toEqual(["12 h"]);
    });

    it("decomposes days only", function() {
      var result = DateUtil.msToMultiplicants(1036800000);

      expect(result).toEqual(["12 d"]);
    });

    it("decomposes milliseconds and seconds", function() {
      var result = DateUtil.msToMultiplicants(9878);

      expect(result).toEqual(["9 sec", "878 ms"]);
    });

    it("decomposes seconds and minutes", function() {
      var result = DateUtil.msToMultiplicants(732000);

      expect(result).toEqual(["12 min", "12 sec"]);
    });

    it("decomposes minutes and hours", function() {
      var result = DateUtil.msToMultiplicants(43920000);

      expect(result).toEqual(["12 h", "12 min"]);
    });

    it("decomposes hours and days", function() {
      var result = DateUtil.msToMultiplicants(1080000000);

      expect(result).toEqual(["12 d", "12 h"]);
    });
  });

  describe("#msToRelativeTime", function() {
    it("defaults to returning the suffix", function() {
      const date = new Date();
      date.setYear(date.getFullYear() - 1);
      const result = DateUtil.msToRelativeTime(date.getTime());

      expect(result).toEqual("1 year ago");
    });

    it("suppresses the suffix if specified", function() {
      const date = new Date();
      date.setYear(date.getFullYear() - 1);
      const result = DateUtil.msToRelativeTime(date.getTime(), true);

      expect(result).toEqual("1 year");
    });

    it('returns "in a year" if the date in a year from now', function() {
      const date = new Date();
      date.setYear(date.getFullYear() + 1);
      const result = DateUtil.msToRelativeTime(date);

      expect(result).toEqual("in 1 year");
    });
  });

  describe("#strToMs", function() {
    it("returns value of date in ms (1)", function() {
      expect(DateUtil.strToMs("1990-01-03T00:00:00Z-1")).toEqual(631324800000);
    });
    it("returns value of date in ms (2)", function() {
      expect(DateUtil.strToMs("1990-01-03t00:00:00z-1")).toEqual(631324800000);
    });
    it("returns value of date in ms (3)", function() {
      expect(DateUtil.strToMs("1990-01-03T00:00:00Z")).toEqual(631324800000);
    });
    it("returns value of date in ms (4)", function() {
      expect(DateUtil.strToMs("1990-01-03t00:00:00z")).toEqual(631324800000);
    });

    it("returns null if called with something other then string (int)", function() {
      expect(DateUtil.strToMs(0)).toEqual(null);
    });
    it("returns null if called with something other then string (array)", function() {
      expect(DateUtil.strToMs([])).toEqual(null);
    });

    it("returns null if the string is undefined or null", function() {
      expect(DateUtil.strToMs(null)).toEqual(null);
      expect(DateUtil.strToMs(undefined)).toEqual(null);
    });
  });

  describe("#isValidDate", function() {
    it("return true for a valid date", function() {
      expect(DateUtil.isValidDate("1990-01-03T00:00:00.000+0000")).toEqual(
        true
      );
    });

    it("return false for an invalid date", function() {
      expect(DateUtil.isValidDate("foo")).toEqual(false);
    });

    it("returns false for null", function() {
      expect(DateUtil.isValidDate(null)).toEqual(false);
    });
  });
});
