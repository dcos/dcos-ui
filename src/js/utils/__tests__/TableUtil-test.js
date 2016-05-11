jest.dontMock('../TableUtil');

var MarathonStore = require('../../stores/MarathonStore');
var TableUtil = require('../TableUtil');
var Util = require('../Util');

describe('TableUtil', function () {
  beforeEach(function () {
    this.getServiceHealth = MarathonStore.getServiceHealth;

    this.foo = {
      equal: 0,
      id: 'foo',
      name: null,
      statuses: [{timestamp: 1}, {timestamp: 2}],
      version: '1.0.1'
    };
    this.bar = {
      equal: 0,
      id: 'bar',
      name: 'bar',
      statuses: [{timestamp: 4}],
      version: undefined
    };
  });

  describe('#getSortFunction', function () {

    beforeEach(function () {
      this.getProp = function (obj, prop) {
        if (prop === 'timestamp') {
          return Util.last(obj.statuses)[prop];
        }

        return obj[prop];
      };

      this.sortFunction = TableUtil.getSortFunction('id', this.getProp);
    });

    it('should return a function', function () {
      expect(typeof this.sortFunction).toEqual('function');
    });

    it('should compare ids values', function () {
      var sortPropFunction = this.sortFunction('id');
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should handle null values', function () {
      var sortPropFunction = this.sortFunction('name');
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should handle undefined values', function () {
      var sortPropFunction = this.sortFunction('version');
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should handle nested propeties through getter function', function () {
      var sortPropFunction = this.sortFunction('timestamp');
      expect(sortPropFunction(this.foo, this.bar)).toEqual(-1);
    });

    it('should use if values are equal tiebreaker', function () {
      var sortPropFunction = this.sortFunction('equal');
      expect(sortPropFunction(this.foo, this.bar)).toEqual(1);
    });

    it('should handle alternative tiebreaker', function () {
      var sortFunction = TableUtil.getSortFunction('timestamp', this.getProp);
      var sortPropFunction = sortFunction('equal');
      expect(sortPropFunction(this.foo, this.bar)).toEqual(-1);
    });

  });

});
