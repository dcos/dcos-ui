var _ = require('underscore');
jest.dontMock('../Util');

var Util = require('../Util');

describe('Util', function () {

  describe('#findLastIndex', function () {

    it('should return -1 if empty array', function () {
      var array = [];
      var index = Util.findLastIndex(array, function (obj) {
        return obj === 1;
      });
      expect(index).toEqual(-1);
    });
    it('should return -1 if not found', function () {
      var array = [1, 2, 3, 4, 5];
      var index = Util.findLastIndex(array, function (obj) {
        return obj === 6;
      });
      expect(index).toEqual(-1);
    });
    it('should return 4', function () {
      var array = [3, 3, 2, 3, 3, 5];
      var index = Util.findLastIndex(array, function (obj) {
        return obj === 3;
      });
      expect(index).toEqual(4);
    });
    it('should return 1', function () {
      var array = [{a: 'a', b: 'bbb'}, {a: 'a', b: 'bbb'}, {a: 'a', b: 'b'}];
      var index = Util.findLastIndex(array, function (obj) {
        return obj.b === 'bbb';
      });
      expect(index).toEqual(1);
    });
  });

  describe('#isArray', function () {

    it('should return true if passed an array', function () {
      var result = Util.isArray([]);

      expect(result).toEqual(true);
    });

    it('should return false if passed arguments', function () {
      var result = Util.isArray(arguments);

      expect(result).toEqual(false);
    });

    it('should return false if passed null', function () {
      var result = Util.isArray(null);

      expect(result).toEqual(false);
    });

    it('should return false if passed undefined', function () {
      var result = Util.isArray(undefined);

      expect(result).toEqual(false);
    });

    it('should return false if passed NaN', function () {
      var result = Util.isArray(NaN);

      expect(result).toEqual(false);
    });

    it('should return false if passed an object (not an array)', function () {
      var result = Util.isArray({});

      expect(result).toEqual(false);
    });

    it('should return false if passed a boolean', function () {
      var result = Util.isArray(true);

      expect(result).toEqual(false);
    });

    it('should return false if passed an integer', function () {
      var result = Util.isArray(100);

      expect(result).toEqual(false);
    });

    it('should return false if passed an string', function () {
      var result = Util.isArray('foo');

      expect(result).toEqual(false);
    });

  });

  describe('#findNestedPropertyInObject', function () {

    beforeEach(function () {
      this.searchObject = {
        hello: {is: {it: {me: {you: {are: {looking: {for: '?'} } } } } } }
      };
      this.searchString = 'hello.is.it.me.you.are.looking.for';
    });

    it('', function () {
      expect(
        Util.findNestedPropertyInObject(this.searchObject, this.searchString)
      ).toEqual('?');
    });

    it('', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, 'hello.'))
        .toEqual(undefined);
    });

    it('', function () {
      expect(Util.findNestedPropertyInObject(null, this.searchString))
        .toEqual(null);
    });

    it('', function () {
      expect(Util.findNestedPropertyInObject(undefined, this.searchString))
        .toEqual(null);
    });

    it('', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, '.'))
        .toEqual(undefined);
    });

    it('', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, ''))
        .toEqual(null);
    });

    it('', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, null))
        .toEqual(null);
    });

    it('', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, undefined))
        .toEqual(null);
    });

  });

  describe('#throttleScroll', function () {

    beforeEach(function () {
      this.func = jest.genMockFunction();
      this.throttled = Util.throttleScroll(
        this.func, 200
      ).bind(this, {nativeEvent: {}});
    });

    it('only calls once if called before the wait is finished', function () {
      this.throttled();
      this.throttled();
      this.throttled();
      this.throttled();
      expect(this.func.mock.calls.length).toBe(1);
    });

    it('calls the function if called after the wait', function () {
      var throttled = this.throttled;
      var func = this.func;

      throttled();
      throttled();
      throttled();
      jest.runAllTimers();

      // The calls should be two because #throttleScroll will remember if it
      // was called during the wait and will invoke itself immediately once the
      // wait is over.
      expect(func.mock.calls.length).toBe(2);
    });

  });

  describe('#debounce', function () {

    beforeEach(function () {
      this.func = jest.genMockFunction();
      this.debounced = Util.debounce(
        this.func, 200
      ).bind(this, {nativeEvent: {}});
    });

    it('calls the function', function () {
      this.debounced();
      jest.runAllTimers();

      expect(this.func.mock.calls.length).toBe(1);
    });

    it('it calls the function only once after consecutive calls', function () {
      this.debounced();
      this.debounced();
      this.debounced();
      jest.runAllTimers();

      expect(this.func.mock.calls.length).toBe(1);
    });

    it('calls function with final arguments', function () {
      this.debounced('foo');
      this.debounced('bar');
      this.debounced('baz');
      jest.runAllTimers();

      expect(this.func.mock.calls[0][1]).toBe('baz');
    });

  });

});
