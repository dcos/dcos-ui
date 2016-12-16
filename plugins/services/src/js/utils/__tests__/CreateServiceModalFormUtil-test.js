const CreateServiceModalFormUtil = require('../CreateServiceModalFormUtil');

describe('CreateServiceModalFormUtil', function () {
  describe('#applyPatch', function () {

    it('should always return cloned objects', function () {
      const data = {a: 'foo'};
      const patch = {};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).not.toBe(data);
    });

    it('should not modify source data on empty patch', function () {
      const data = {a: 'foo'};
      const patch = {};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should create new fields if missing', function () {
      const data = {a: 'foo'};
      const patch = {b: 'bar'};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo', b: 'bar'});
    });

    it('should remove fields if patch value is undefined', function () {
      const data = {a: 'foo'};
      const patch = {a: undefined};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is null', function () {
      const data = {a: 'foo'};
      const patch = {a: null};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is \'\'', function () {
      const data = {a: 'foo'};
      const patch = {a: ''};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is {}', function () {
      const data = {a: 'foo'};
      const patch = {a: {}};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should remove fields if patch value is []', function () {
      const data = {a: 'foo'};
      const patch = {a: []};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should preserve string source type if array is given', function () {
      const data = {a: 'foo'};
      const patch = {a: ['a']};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should preserve string source type if object is given', function () {
      const data = {a: 'foo'};
      const patch = {a: {b: 'c'}};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should preserve string source type if number is given', function () {
      const data = {a: 'foo'};
      const patch = {a: 42};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: 'foo'});
    });

    it('should preserve null source type if null is given', function () {
      const data = {a: null};
      const patch = {a: null};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

    it('should preserve null source type if \'\' is given', function () {
      const data = {a: null};
      const patch = {a: ''};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

    it('should preserve null source type if [] is given', function () {
      const data = {a: null};
      const patch = {a: []};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

    it('should preserve null source type if {} is given', function () {
      const data = {a: null};
      const patch = {a: {}};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: null});
    });

    it('should preserve [] source type if number is given', function () {
      const data = {a: [1, 2, 3]};
      const patch = {a: 42};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: [1, 2, 3]});
    });

    it('should remove empty fields from patch objects', function () {
      const data = {a: null};
      const patch = {a: {b: null, c:'', d:'foo'}};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: {d: 'foo'}});
    });

    it('should keep the original empty value if patch object is empty', function () {
      const data = {a: {}};
      const patch = {a: {b: null, c:'', d:undefined}};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: {}});
    });

    it('should recursively remove empty fields from patch objects', function () {
      const data = {a: {b: 'foo', c: {d: 'bar'}}};
      const patch = {a: {b: 'foo', c: {d: null}}};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: {b: 'foo'}});
    });

    it('should strip empty propeties from patch-only objects', function () {
      const data = {};
      const patch = {a: {b: 'foo', c: {d: null}}};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: {b: 'foo'}});
    });

    it('should properly create new array structures', function () {
      const data = {};
      const patch = {a: [{b: 'foo'}, {c: 'bar'}]};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: [{b: 'foo'}, {c: 'bar'}]});
    });

    it('should not create empty array structures', function () {
      const data = {};
      const patch = {a: []};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should not create array structures that contain empty items', function () {
      const data = {};
      const patch = {a: [null, undefined, '', {}]};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });

    it('should replace array structures when patching', function () {
      const data = {a: [1, 2, 3, 4]};
      const patch = {a: [3, 4]};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({a: [3, 4]});
    });

    it('should remove array structures with empty value', function () {
      const data = {a: [1, 2]};
      const patch = {a: null};
      const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
      expect(patched).toEqual({});
    });
  });
});

