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
});
