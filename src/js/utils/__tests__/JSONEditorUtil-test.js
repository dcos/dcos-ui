jest.dontMock('../JSONEditorUtil');

const JSONEditorUtil = require('../JSONEditorUtil');

describe('JSONEditorUtil', function () {

  describe('#cursorFromOffset', function () {

    it('should properly resolve beginning edge', function () {
      let text = 'some oneline text';
      expect(JSONEditorUtil.cursorFromOffset(0, text)).toEqual({
        row: 0, column: 0
      });
    });

    it('should properly resolve ending edge', function () {
      let text = 'some oneline text';
      expect(JSONEditorUtil.cursorFromOffset(16, text)).toEqual({
        row: 0, column: 16
      });
    });

    it('should ignore negative offsets', function () {
      let text = 'some oneline text';
      expect(JSONEditorUtil.cursorFromOffset(-1, text)).toEqual({
        row: 0, column: 0
      });
    });

    it('should ignore offsets exceeding string length', function () {
      let text = 'some oneline text';
      expect(JSONEditorUtil.cursorFromOffset(20, text)).toEqual({
        row: 0, column: 17
      });
    });

    it('should properly resolve offset in multiline text', function () {
      let text = 'first line\nsecond line\nthird line';
      expect(JSONEditorUtil.cursorFromOffset(13, text)).toEqual({
        row: 1, column: 2
      });
    });

  });

  describe('#deepObjectDiff', function () {

    it('should detect added values', function () {
      let a = {};
      let b = {a: 'foo'};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a'], value: 'foo', previous: undefined},
        {path: [], value: {a: 'foo'}, previous: {}}
      ]);
    });

    it('should detect removed values', function () {
      let a = {a: 'foo'};
      let b = {};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a'], value: undefined, previous: 'foo'},
        {path: [], value: {}, previous: {a: 'foo'}}
      ]);
    });

    it('should detect modified values', function () {
      let a = {a: 'foo'};
      let b = {a: 'bar'};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a'], value: 'bar', previous: 'foo'},
        {path: [], value: {a: 'bar'}, previous: {a: 'foo'}}
      ]);
    });

    it('should detect added values in arrays', function () {
      let a = {a: []};
      let b = {a: ['foo']};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', '0'], value: 'foo', previous: undefined},
        {path: ['a'], value: ['foo'], previous: []},
        {path: [], value: {a: ['foo']}, previous: {a: []}}
      ]);
    });

    it('should detect removed values in arrays', function () {
      let a = {a: ['foo']};
      let b = {a: []};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', '0'], value: undefined, previous: 'foo'},
        {path: ['a'], value: [], previous: ['foo']},
        {path: [], value: {a: []}, previous: {a: ['foo']}}
      ]);
    });

    it('should detect modified values in arrays', function () {
      let a = {a: ['foo']};
      let b = {a: ['bar']};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', '0'], value: 'bar', previous: 'foo'},
        {path: ['a'], value: ['bar'], previous: ['foo']},
        {path: [], value: {a: ['bar']}, previous: {a: ['foo']}}
      ]);
    });

    it('should detect added values in objects', function () {
      let a = {a: {}};
      let b = {a: {b: 'foo'}};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', 'b'], value: 'foo', previous: undefined},
        {path: ['a'], value: {b: 'foo'}, previous: {}},
        {path: [], value: {a: {b: 'foo'}}, previous: {a: {}}}
      ]);
    });

    it('should detect removed values in objects', function () {
      let a = {a: {b: 'foo'}};
      let b = {a: {}};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', 'b'], value: undefined, previous: 'foo'},
        {path: ['a'], value: {}, previous: {b: 'foo'}},
        {path: [], value: {a: {}}, previous: {a: {b: 'foo'}}}
      ]);
    });

    it('should detect modified values in objects', function () {
      let a = {a: {b: 'foo'}};
      let b = {a: {b: 'bar'}};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', 'b'], value: 'bar', previous: 'foo'},
        {path: ['a'], value: {b: 'bar'}, previous: {b: 'foo'}},
        {path: [], value: {a: {b: 'bar'}}, previous: {a: {b: 'foo'}}}
      ]);
    });

    it('should handle object-to-array mutations', function () {
      let a = {a: {b: 'foo'}};
      let b = {a: ['foo']};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', 'b'], value: undefined, previous: 'foo'},
        {path: ['a', '0'], value: 'foo', previous: undefined},
        {path: ['a'], value: ['foo'], previous: {b: 'foo'}},
        {path: [], value: {a: ['foo']}, previous: {a: {b: 'foo'}}}
      ]);
    });

    it('should handle object-to-scalar mutations', function () {
      let a = {a: {b: 'foo'}};
      let b = {a: 'bar'};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a'], value: 'bar', previous: {b: 'foo'}},
        {path: [], value: {a: 'bar'}, previous: {a: {b: 'foo'}}}
      ]);
    });

    it('should handle array-to-object mutations', function () {
      let a = {a: ['foo']};
      let b = {a: {b: 'foo'}};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a', '0'], value: undefined, previous: 'foo'},
        {path: ['a', 'b'], value: 'foo', previous: undefined},
        {path: ['a'], value: {b: 'foo'}, previous: ['foo']},
        {path: [], value: {a: {b: 'foo'}}, previous: {a: ['foo']}}
      ]);
    });

    it('should handle scalar-to-object mutations', function () {
      let a = {a: 'bar'};
      let b = {a: {b: 'foo'}};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a'], value: {b: 'foo'}, previous: 'bar'},
        {path: [], value: {a: {b: 'foo'}}, previous: {a: 'bar'}}
      ]);
    });

    it('should handle null-to-object mutations', function () {
      let a = {a: null};
      let b = {a: {b: 'foo'}};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a'], value: {b: 'foo'}, previous: null},
        {path: [], value: {a: {b: 'foo'}}, previous: {a: null}}
      ]);
    });

    it('should handle object-to-null mutations', function () {
      let a = {a: {b: 'foo'}};
      let b = {a: null};

      expect(JSONEditorUtil.deepObjectDiff(a, b)).toEqual([
        {path: ['a'], value: null, previous: {b: 'foo'}},
        {path: [], value: {a: null}, previous: {a: {b: 'foo'}}}
      ]);
    });
  });

  describe('#sortObjectKeys', function () {

    it('should order keys according to old ones', function () {
      let a = {a:0, b:1, c:2};
      let b = {c:3, a:4, b:5};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(['a', 'b', 'c']);
      expect(value).toEqual({a:4, b:5, c:3});
    });

    it('should order less than previous keys in the same order', function () {
      let a = {a:0, b:1, c:2};
      let b = {c:3, a:4};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(['a', 'c']);
      expect(value).toEqual({a:4, c:3});
    });

    it('should add new keys at the end of the object', function () {
      let a = {a:0, b:1, c:2};
      let b = {c:3, a:4, d:5};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value)).toEqual(['a', 'c', 'd']);
      expect(value).toEqual({a:4, c:3, d:5});
    });

    it('should order keys according to old ones (nested)', function () {
      let a = {o: {a:0, b:1, c:2}};
      let b = {o: {c:3, a:4, b:5}};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(['a', 'b', 'c']);
      expect(value).toEqual({o: {a:4, b:5, c:3}});
    });

    it('should order less than previous keys in the same order (nested)', function () {
      let a = {o: {a:0, b:1, c:2}};
      let b = {o: {c:3, a:4}};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(['a', 'c']);
      expect(value).toEqual({o: {a:4, c:3}});
    });

    it('should add new keys at the end of the object (nested)', function () {
      let a = {o: {a:0, b:1, c:2}};
      let b = {o: {c:3, a:4, d:5}};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.o)).toEqual(['a', 'c', 'd']);
      expect(value).toEqual({o: {a:4, c:3, d:5}});
    });

    it('should order array values', function () {
      let a = {a: ['a', 'b', 'c']};
      let b = {a: ['b', 'a', 'c']};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({a: ['a', 'b', 'c']});
    });

    it('should add new array values at the end', function () {
      let a = {a: ['a', 'b', 'c']};
      let b = {a: ['d', 'b', 'a']};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({a: ['a', 'b', 'd']});
    });

    it('should order objects in array values', function () {
      let a = {a: [
        {a:1, b:2, c:3},
        {b:1, a:2, c:3}
      ]};
      let b = {a: [
        {a:4, c:6, b:5},
        {c:6, b:4, a:5}
      ]};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.a[0])).toEqual(['a', 'b', 'c']);
      expect(Object.keys(value.a[1])).toEqual(['b', 'a', 'c']);
      expect(value).toEqual({a: [
        {a:4, b:5, c:6},
        {b:4, a:5, c:6}
      ]});
    });

    it('should order new keys at the end of objects in array values', function () {
      let a = {a: [
        {a:1, b:2, c:3},
        {b:1, a:2, c:3}
      ]};
      let b = {a: [
        {a:4, d:6, c:3, b:5},
        {d:6, b:4, a:5, c:8}
      ]};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(Object.keys(value.a[0])).toEqual(['a', 'b', 'c', 'd']);
      expect(Object.keys(value.a[1])).toEqual(['b', 'a', 'c', 'd']);
      expect(value).toEqual({a: [
        {a:4, b:5, c:3, d:6},
        {b:4, a:5, c:8, d:6}
      ]});
    });

    it('should properly handle null-to-object comparisions', function () {
      let a = {a: {b: 'foo', c: 'bar'}};
      let b = {a: null};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({a: null});
    });

    it('should place object values in keys that were null before', function () {
      let a = {a: null};
      let b = {a: {b: 'foo', c: 'bar'}};

      let value = JSONEditorUtil.sortObjectKeys(a, b);
      expect(value).toEqual({a: {b: 'foo', c: 'bar'}});
    });

  });

});
