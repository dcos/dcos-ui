jest.dontMock("../DateUtil");

const DateUtil = require("../DateUtil");

describe("DateUtil", function() {
  describe("#msToMultiplicants", function() {
    it("should decompose milliseconds only", function() {
      var result = DateUtil.msToMultiplicants(987);

      expect(result).toEqual(["987 ms"]);
    });

    it("should decompose seconds only", function() {
      var result = DateUtil.msToMultiplicants(12000);

      expect(result).toEqual(["12 sec"]);
    });

    it("should decompose minutes only", function() {
      var result = DateUtil.msToMultiplicants(720000);

      expect(result).toEqual(["12 min"]);
    });

    it("should decompose hours only", function() {
      var result = DateUtil.msToMultiplicants(43200000);

      expect(result).toEqual(["12 h"]);
    });

    it("should decompose days only", function() {
      var result = DateUtil.msToMultiplicants(1036800000);

      expect(result).toEqual(["12 d"]);
    });

    it("should decompose milliseconds and seconds", function() {
      var result = DateUtil.msToMultiplicants(9878);

      expect(result).toEqual(["9 sec", "878 ms"]);
    });

    it("should decompose seconds and minutes", function() {
      var result = DateUtil.msToMultiplicants(732000);

      expect(result).toEqual(["12 min", "12 sec"]);
    });

    it("should decompose minutes and hours", function() {
      var result = DateUtil.msToMultiplicants(43920000);

      expect(result).toEqual(["12 h", "12 min"]);
    });

    it("should decompose hours and days", function() {
      var result = DateUtil.msToMultiplicants(1080000000);

      expect(result).toEqual(["12 d", "12 h"]);
    });
  });

  describe("#msToDateStr", function() {
    it("should return the correct string for AM", function() {
      // December is 11 due to months being 0-based index.
      var christmas = new Date(2015, 11, 25, 8, 13);
      var christmasValue = christmas.valueOf();

      var result = DateUtil.msToDateStr(christmasValue);

      expect(result).toEqual("12-25-2015 at 8:13am");
    });

    it("should return the correct string for PM", function() {
      var halloween = new Date(2015, 9, 31, 20, 30);
      var halloweenValue = halloween.valueOf();

      var result = DateUtil.msToDateStr(halloweenValue);

      expect(result).toEqual("10-31-2015 at 8:30pm");
    });

    it("can handle older dates", function() {
      var specialDay = new Date(1993, 9, 19, 11, 29);
      var specialDayValue = specialDay.valueOf();

      var result = DateUtil.msToDateStr(specialDayValue);

      expect(result).toEqual("10-19-1993 at 11:29am");
    });
  });

  describe("#msToRelativeTime", function() {
    it("defaults to returning the suffix", function() {
      const date = new Date();
      date.setYear(date.getFullYear() - 1);
      const result = DateUtil.msToRelativeTime(date.getTime());

      expect(result).toEqual("a year ago");
    });

    it("suppresses the suffix if specified", function() {
      const date = new Date();
      date.setYear(date.getFullYear() - 1);
      const result = DateUtil.msToRelativeTime(date.getTime(), true);

      expect(result).toEqual("a year");
    });

    it('returns "in a year" if the date in a year from now', function() {
      const date = new Date();
      date.setYear(date.getFullYear() + 1);
      const result = DateUtil.msToRelativeTime(date);

      expect(result).toEqual("in a year");
    });
  });

  describe("#strToMs", function() {
    it("returns value of date in ms", function() {
      expect(DateUtil.strToMs("1990-01-03T00:00:00Z-1")).toEqual(631324800000);
    });

    it("returns null if the string is undefined or null", function() {
      expect(DateUtil.strToMs(null)).toEqual(null);
      expect(DateUtil.strToMs(undefined)).toEqual(null);
    });
  });
});
