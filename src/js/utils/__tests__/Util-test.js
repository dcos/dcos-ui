jest.dontMock('../Util');

var Util = require('../Util');

describe('Util', function () {

  describe('#uniqueID', function () {

    it('should return a unique ID each time it is called', function () {
      let ids = Array(100).fill(null);
      ids.forEach(function (value, index) {
        ids[index] = Util.uniqueID('100');
      });

      let result = ids.every(function (id, index, array) {
        return !array.includes(id, index + 1);
      });

      expect(result).toBeTruthy();
    });

    it('should provide an integer', function () {
      let id = Util.uniqueID('integerID');

      expect(typeof id === 'number' && id % 1 === 0).toBeTruthy();
    });

    it('should start over from 0 for each namespace', function () {
      Util.uniqueID('firstNamespace');
      Util.uniqueID('firstNamespace');
      let id1 =Util.uniqueID('firstNamespace');
      let id2 = Util.uniqueID('secondNamespace');

      expect(id1).toEqual(2);
      expect(id2).toEqual(0);
    });

  });

  describe('#omit', function () {

    it('should return a copy of the object', function () {
      var obj = {'foo': 'bar'};
      var newObject = Util.omit(obj, []);

      newObject.foo = 'modified';

      expect(obj.foo).toEqual('bar');
    });

    it('should omit key given', function () {
      var obj = {
        'foo': 'bar',
        'qq': 'zzz'
      };
      var newObject = Util.omit(obj, ['qq']);

      expect(Object.keys(newObject).length).toEqual(1);
      expect(newObject.foo).toEqual('bar');
      expect(newObject.qq).toEqual(undefined);
    });

    it('should omit multiple keys', function () {
      var obj = {
        'foo': 'bar',
        'qq': 'zzz',
        'three': 'pie'
      };
      var newObject = Util.omit(obj, ['foo', 'three']);

      expect(Object.keys(newObject).length).toEqual(1);
      expect(newObject.qq).toEqual('zzz');
      expect(newObject.three).toEqual(undefined);
    });
  });

  describe('#last', function () {

    it('should return the last element in an array', function () {
      var array = [0, 1, 2, 3];
      var last = Util.last(array);

      expect(last).toEqual(3);
    });

    it('should return the last element for an array of size 1', function () {
      var array = [0];
      var last = Util.last(array);

      expect(last).toEqual(0);
    });

    it('should return null when given empty array', function () {
      var array = [];
      var last = Util.last(array);

      expect(last).toEqual(null);
    });

  });

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

  describe('#findNestedPropertyInObject', function () {

    beforeEach(function () {
      this.searchObject = {
        hello: {is: {it: {me: {you: {are: {looking: {for: '?'} } } } } } }
      };
      this.searchString = 'hello.is.it.me.you.are.looking.for';
    });

    it('should find a nested defined property', function () {
      expect(
        Util.findNestedPropertyInObject(this.searchObject, this.searchString)
      ).toEqual('?');
    });

    it('should handle nested empty string definitions gracefully', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, 'hello.'))
        .toEqual(undefined);
    });

    it('should handle null search object gracefully', function () {
      expect(Util.findNestedPropertyInObject(null, this.searchString))
        .toEqual(null);
    });

    it('should handle undefined gracefully', function () {
      expect(Util.findNestedPropertyInObject(undefined, this.searchString))
        .toEqual(null);
    });

    it('should handle nested empty strings gracefully', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, '.'))
        .toEqual(undefined);
    });

    it('should handle nested empty string definition gracefully', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, ''))
        .toEqual(undefined);
    });

    it('should handle null definition gracefully', function () {
      expect(Util.findNestedPropertyInObject(this.searchObject, null))
        .toEqual(null);
    });

    it('should handle undefined definition gracefully', function () {
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

  describe('deepCopy', function () {

    it('it returns an actual deep copy', function () {
      var currentDate = new Date();

      var originalObject = {
        obj1: {
          string2: 'string2',
          number2: 2,
          func: function () {
            return true;
          },
          obj2: {
            string3: 'string3',
            number3: 3,
            date: currentDate,
            obj3: {
              array2: ['a', 'b'],
              number3: 3
            }
          }
        },
        string1: 'string1',
        number1: 1,
        array1: [1, 2]
      };

      var copiedObject = Util.deepCopy(originalObject);
      expect(copiedObject).toEqual(originalObject);
    });

    it('mutating the copy does not affect the original', function () {
      var currentDate = new Date();

      var originalObject = {
        obj1: {
          obj2: {
            string3: 'string3',
            number3: 3,
            date: currentDate,
            obj3: {
              array2: ['a', 'b'],
              number3: 3
            }
          }
        },
        string1: 'string1',
        number1: 1,
        array1: [1, 2]
      };

      // An exact replica of the originalObject
      var originalObject2 = {
        obj1: {
          obj2: {
            string3: 'string3',
            number3: 3,
            date: currentDate,
            obj3: {
              array2: ['a', 'b'],
              number3: 3
            }
          }
        },
        string1: 'string1',
        number1: 1,
        array1: [1, 2]
      };

      var copiedObject = Util.deepCopy(originalObject);
      copiedObject.obj1.obj2 = null;
      expect(copiedObject).not.toEqual(originalObject);
      expect(originalObject2).toEqual(originalObject);
    });

    it('does not clone out of bounds arrays', function () {
      var originalObject = {
        obj1: {
          array1: [1, 2]
        }
      };

      var number = 83864234234;
      originalObject.obj1.array1[number] = 3;

      var copiedObject = Util.deepCopy(originalObject);
      expect(copiedObject).not.toEqual(originalObject);
    });

    it('does clone an array with normal indices', function () {
      var originalObject = {
        array: []
      };
      originalObject.array[0] = 'test';

      var expectedObject = {
        array: []
      };
      expectedObject.array[0] = 'test';

      expect(Util.deepCopy(originalObject)).toEqual(expectedObject);
    });

    it('does clone an array with unusual small indices', function () {
      var originalObject = {
        array: []
      };
      originalObject.array[2] = 'test';

      var expectedObject = {
        array: []
      };
      expectedObject.array[2] = 'test';

      expect(Util.deepCopy(originalObject)).toEqual(expectedObject);
    });

  });

});
