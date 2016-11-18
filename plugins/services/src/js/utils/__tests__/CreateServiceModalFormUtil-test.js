const CreateServiceModalFormUtil = require('../CreateServiceModalFormUtil');

describe('CreateServiceModalFormUtil', function () {
  describe('#applyPatch', function () {

    it('should always return cloned objects', function () {
      let data = {a: 'foo'};
      let patch = {};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).not.toBe(data);
    });

    it('should not modify source data on empty patch', function () {
      let data = {a: 'foo'};
      let patch = {};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should create new fields if missing', function () {
      let data = {a: 'foo'};
      let patch = {b: 'bar'};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo', b: 'bar'});
    });

    it('should remove fields if patch value is undefined', function () {
      let data = {a: 'foo'};
      let patch = {a: undefined};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is null', function () {
      let data = {a: 'foo'};
      let patch = {a: null};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is \'\'', function () {
      let data = {a: 'foo'};
      let patch = {a: ''};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is {}', function () {
      let data = {a: 'foo'};
      let patch = {a: {}};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is []', function () {
      let data = {a: 'foo'};
      let patch = {a: []};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should preserve string source type if array is given', function () {
      let data = {a: 'foo'};
      let patch = {a: ['a']};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should preserve string source type if object is given', function () {
      let data = {a: 'foo'};
      let patch = {a: {b: 'c'}};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should preserve string source type if number is given', function () {
      let data = {a: 'foo'};
      let patch = {a: 42};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should preserve null source type if null is given', function () {
      let data = {a: null};
      let patch = {a: null};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

    it('should preserve null source type if \'\' is given', function () {
      let data = {a: null};
      let patch = {a: ''};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

    it('should preserve null source type if [] is given', function () {
      let data = {a: null};
      let patch = {a: []};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

    it('should preserve null source type if {} is given', function () {
      let data = {a: null};
      let patch = {a: {}};
      let patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

  });

  describe('#isEmptyValue', function () {
    it('should consider `undefined` to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue(undefined)).toBeTruthy();
    });

    it('should consider `null` to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue(null)).toBeTruthy();
    });

    it('should consider `\'\'` to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue('')).toBeTruthy();
    });

    it('should consider `{}` to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue({})).toBeTruthy();
    });

    it('should consider `[]` to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue([])).toBeTruthy();
    });

    it('should consider `0` not to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue(0)).toBeFalsy();
    });

    it('should consider `\'a\'` not to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue('a')).toBeFalsy();
    });

    it('should consider `[1]` not to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue([1])).toBeFalsy();
    });

    it('should consider `{a: \'foo\'}` not to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue({a: 'foo'})).toBeFalsy();
    });

    it('should consider `NaN` not to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue(NaN)).toBeFalsy();
    });

    it('should consider `Infinity` not to be an empty value', function () {
      expect(CreateServiceModalFormUtil.isEmptyValue(Infinity)).toBeFalsy();
    });
  });
});

