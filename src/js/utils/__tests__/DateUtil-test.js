jest.dontMock('../DateUtil');

var DateUtil = require('../DateUtil');

describe('DateUtil', function () {
  describe('#msToDateStr', function () {
    it('should return the correct string for AM', function () {
      // December is 11 due to months being 0-based index.
      var christmas = new Date(2015, 11, 25, 8, 13);
      var christmasValue = christmas.valueOf();

      var result = DateUtil.msToDateStr(christmasValue);

      expect(result).toEqual('12-25-15 at 8:13 am');
    });

    it('should return the correct string for PM', function () {
      var halloween = new Date(2015, 9, 31, 20, 30);
      var halloweenValue = halloween.valueOf();

      var result = DateUtil.msToDateStr(halloweenValue);

      expect(result).toEqual('10-31-15 at 8:30 pm');
    });

    it('can handle older dates', function () {
      var specialDay = new Date(1993, 9, 19, 11, 29);
      var specialDayValue = specialDay.valueOf();

      var result = DateUtil.msToDateStr(specialDayValue);

      expect(result).toEqual('10-19-93 at 11:29 am');
    });
  });

  describe('#msToRelativeTime', function () {
    it('defaults to returning the suffix', function () {
      let date = new Date();
      date.setYear(date.getFullYear() - 1);
      let result = DateUtil.msToRelativeTime(date.getTime());

      expect(result).toEqual('a year ago');
    });

    it('suppresses the suffix if specified', function () {
      let date = new Date();
      date.setYear(date.getFullYear() - 1);
      let result = DateUtil.msToRelativeTime(date.getTime(), true);

      expect(result).toEqual('a year');
    });
  });

  describe('#dateToRelativeTime', function () {
    it('returns "in a year" if the date in a year from now', function () {
      let date = new Date();
      date.setYear(date.getFullYear() + 1);
      let result = DateUtil.dateToRelativeTime(date);

      expect(result).toEqual('in a year');
    });
  });

  describe('#strToMs', function () {
    it('returns value of date in ms', function () {
      expect(DateUtil.strToMs('1990-01-03T00:00:00Z-1')).toEqual(631324800000);
    });

    it('returns null if the string is undefined or null', function () {
      expect(DateUtil.strToMs(null)).toEqual(null);
      expect(DateUtil.strToMs(undefined)).toEqual(null);
    });
  });
});
