jest.dontMock('../DataValidatorUtil');

const DataValidatorUtil = require('../DataValidatorUtil');

describe('DataValidatorUtil', function () {

  describe('#errorArrayToMap', function () {

    it('should correctly return an object', function () {
      var obj = DataValidatorUtil.errorArrayToMap([
        {path: ['a', 'b'], message: 'Foo'}
      ]);
      expect(obj).toEqual({a: {b: 'Foo'}});
    });

    it('should correctly merge paths that share the same base', function () {
      var obj = DataValidatorUtil.errorArrayToMap([
        {path: ['a', 'b'], message: 'Foo'},
        {path: ['a', 'c'], message: 'Bar'}
      ]);
      expect(obj).toEqual({a: {b: 'Foo', c: 'Bar'}});
    });

    it('should correctly create arrays when numbers in path', function () {
      var obj = DataValidatorUtil.errorArrayToMap([
        {path: ['a', 0, 'b'], message: 'Foo'},
        {path: ['a', 5, 'b'], message: 'Bar'}
      ]);
      expect(obj).toEqual({a: [
        {b: 'Foo'}, undefined, undefined, undefined, undefined, {b: 'Bar'}
      ]});
    });

    it('should correctly merge errors in the same path', function () {
      var obj = DataValidatorUtil.errorArrayToMap([
        {path: ['a', 'b'], message: 'Foo'},
        {path: ['a', 'b'], message: 'Bar'}
      ]);
      expect(obj).toEqual({a: {b: 'Foo, Bar'}});
    });

  });

});
