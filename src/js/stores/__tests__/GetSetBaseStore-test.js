var GetSetBaseStore = require('../GetSetBaseStore');

describe('GetSetBaseStore', function () {

  beforeEach(function () {
    this.instance = new GetSetBaseStore();
  });

  describe('#get', function () {

    it('should return undefined if no key is given', function () {
      expect(this.instance.get()).toEqual(null);
    });

    it('should return undefined if given an object', function () {
      expect(this.instance.get({})).toEqual(null);
    });

    it('returns null if property hasn\'t been defined', function () {
      expect(this.instance.get('foo')).toEqual(null);
    });

    it('should return the correct value given a key', function () {
      var instance = this.instance;
      instance.set({someProperty: 'someValue'});
      expect(this.instance.get('someProperty')).toEqual('someValue');
    });

    it('should allow for default state values', function () {
      var instance = new GetSetBaseStore();
      instance.getSet_data = {
        foo: 'bar'
      };

      expect(instance.get('foo')).toEqual('bar');
    });

  });

  describe('#set', function () {

    it('throws an error when called with a non-object', function () {
      var fn = this.instance.set.bind(this.instance, 'string');
      expect(fn).toThrow();
    });

    it('throws an error when called with an array-like object', function () {
      var fn = this.instance.set.bind(this.instance, []);
      expect(fn).toThrow();
    });

    it('overrides previously set values', function () {
      this.instance.set({foo: 1, bar: 2, baz: 3});
      this.instance.set({foo: 'foo', bar: 'bar'});

      expect(this.instance.get('foo')).toEqual('foo');
      expect(this.instance.get('bar')).toEqual('bar');
      expect(this.instance.get('baz')).toEqual(3);
    });

  });

});
