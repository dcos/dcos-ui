jest.dontMock('objektiv');
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

  describe('#updateOnlyMapPath', function () {

    it('should correctly update only parts of the path', function () {
      var oldErrors = {a: {b: 'foo'}, c: 'test'};
      var newErrors = {a: {b: 'bar'}};
      var obj = DataValidatorUtil.updateOnlyMapPath(oldErrors, newErrors, ['a', 'b']);
      expect(obj).toEqual({a: {b: 'bar'}, c: 'test'});
    });

    it('should not touch paths that does not exist', function () {
      var oldErrors = {a: {b: 'foo'}, c: 'test'};
      var newErrors = {a: {b: 'bar'}};
      var obj = DataValidatorUtil.updateOnlyMapPath(oldErrors, newErrors, ['a', 'd']);
      expect(obj).toEqual({a: {b: 'foo'}, c: 'test'});
    });

  });

  describe('#resetOnlyMapPath', function () {

    it('should remove strings only on a given path', function () {
      var oldErrors = {a: {b: 'foo'}, c: 'test'};
      var obj = DataValidatorUtil.resetOnlyMapPath(oldErrors, ['a', 'b']);
      expect(obj).toEqual({a: {}, c: 'test'});
    });

    it('should not touch paths that does not exist', function () {
      var oldErrors = {a: {b: 'foo'}, c: 'test'};
      var obj = DataValidatorUtil.resetOnlyMapPath(oldErrors, ['a', 'd']);
      expect(obj).toEqual({a: {b: 'foo'}, c: 'test'});
    });

  });

});
