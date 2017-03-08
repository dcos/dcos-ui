const ObjectUtil = require('../ObjectUtil');

describe('ObjectUtil', function () {

  describe('#markObject', function () {

    it('should properly mark an object', function () {
      const obj = {};
      const mark = 'mark';

      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });

    it('should properly overwrite previous mark', function () {
      const obj = {};
      const previousMark = 'mork';
      const mark = 'mark';

      ObjectUtil.markObject(obj, previousMark);
      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });

  });

  describe('#objectHasMark', function () {

    it('should return false on unmarked objects', function () {
      const obj = {};
      const mark = 'mark';
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it('should return true on correctly marked objects', function () {
      const obj = {};
      const mark = 'mark';

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });

    it('should return false on wrongly marked objects', function () {
      const obj = {};
      const mark = 'mark';
      const wrongMark = 'mork';

      ObjectUtil.markObject(obj, wrongMark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it('should correctly handle objects as marks', function () {
      const obj = {};
      const mark = {};
      const wrongMark = {};

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, wrongMark)).toBeFalsy();
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });

  });

  describe('#walkObjectsByPath', function () {

    it('should call the walking function for every but last path item', function () {
      var walkObj = {a: {b: {c: 0}}};

      var mockWalkFn = jest.fn();
      mockWalkFn
        .mockReturnValueOnce(walkObj.a)
        .mockReturnValueOnce(walkObj.a.b)
        .mockReturnValue({});

      ObjectUtil.walkObjectsByPath(
        ['a', 'b', 'c'],
        [{
          object: walkObj,
          walkFn: mockWalkFn
        }],
        function () { }
      );

      expect(mockWalkFn.mock.calls).toEqual([
        [walkObj, 'a', 'b'],
        [walkObj.a, 'b', 'c']
      ]);

    });

    it('should not call any walk function if path has length 1', function () {
      var walkObj = {a: {b: {c: 0}}};
      var mockWalkFn = jest.fn();

      ObjectUtil.walkObjectsByPath(
        ['a'],
        [{
          object: walkObj,
          walkFn: mockWalkFn
        }],
        function () { }
      );

      expect(mockWalkFn).not.toBeCalled();

    });

    it('should correctly call the op function', function () {
      var walkObj = {a: {b: {c: 0}}};
      var mockOpFn = jest.fn();

      ObjectUtil.walkObjectsByPath(
        ['a', 'b', 'c'],
        [{
          object: walkObj
        }],
        mockOpFn
      );

      expect(mockOpFn.mock.calls).toEqual([
        [[walkObj.a.b], 'c']
      ]);

    });

    it('should call the correct walk functions', function () {
      var walkObj1 = {a: {b: {c: 0}}};
      var walkObj2 = {a: {b: {c: 0}}};

      var mockWalkFn1 = jest.fn();
      mockWalkFn1
        .mockReturnValueOnce(walkObj1.a)
        .mockReturnValueOnce(walkObj1.a.b)
        .mockReturnValue({});

      var mockWalkFn2 = jest.fn();
      mockWalkFn2
        .mockReturnValueOnce(walkObj2.a)
        .mockReturnValueOnce(walkObj2.a.b)
        .mockReturnValue({});

      ObjectUtil.walkObjectsByPath(
        ['a', 'b', 'c'],
        [
          {
            object: walkObj1,
            walkFn: mockWalkFn1
          },
          {
            object: walkObj2,
            walkFn: mockWalkFn2
          }
        ],
        function () { }
      );

      expect(mockWalkFn1.mock.calls).toEqual([
        [walkObj1, 'a', 'b'],
        [walkObj1.a, 'b', 'c']
      ]);
      expect(mockWalkFn2.mock.calls).toEqual([
        [walkObj2, 'a', 'b'],
        [walkObj2.a, 'b', 'c']
      ]);

    });

    it('should by default add missing object path components', function () {
      var walkObj = {a: {b: {c: 0}}};

      ObjectUtil.walkObjectsByPath(
        ['a', 'b', 'd', 'e'],
        [{
          object: walkObj
        }],
        function () { }
      );

      expect(walkObj).toEqual({
        a: {
          b: {
            c: 0,
            d: { }
          }
        }
      });

    });

    it('should by default add missing array path components', function () {
      var walkObj = {a: {b: {c: 0}}};

      ObjectUtil.walkObjectsByPath(
        ['a', 'b', 'd', '0'],
        [{
          object: walkObj
        }],
        function () { }
      );

      expect(walkObj).toEqual({
        a: {
          b: {
            c: 0,
            d: []
          }
        }
      });

    });

    it('should not modify the object if `walkSkipMissing` used', function () {
      var walkObj = {a: {b: {c: 0}}};

      ObjectUtil.walkObjectsByPath(
        ['a', 'b', 'd', 'e'],
        [{
          object: walkObj,
          walkFn: ObjectUtil.walkSkipMissing
        }],
        function () { }
      );

      expect(walkObj).toEqual({a: {b: {c: 0}}});
    });

    it('should allow opFn to mutate the object', function () {
      var walkObj = {a: {b: {c: 0}}};

      ObjectUtil.walkObjectsByPath(
        ['a', 'b', 'c'],
        [{
          object: walkObj,
          walkFn: ObjectUtil.walkSkipMissing
        }],
        function (objects, key) {
          delete objects[0][key];
        }
      );

      expect(walkObj).toEqual({a: {b: {}}});
    });

  });

});
