const CreateServiceModalFormUtil = require('../CreateServiceModalFormUtil');

const EMPTY_TYPES = [null, undefined, {}, [], ''];
const VALUE_TYPES = [1234, 'foo', {a: 'b'}, ['a']];

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

    describe('Array Clean-ups', function () {

      EMPTY_TYPES.forEach(function (emptyType) {
        const emptyTypeStr = JSON.stringify(emptyType);

        //
        // Empty values are removed from patched arrays
        //

        it(`should remove ${emptyTypeStr} from beginning of array`,
          function () {
            const data = {a: []};
            const patch = {a: [emptyType, 'foo', 'bar']};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: ['foo', 'bar']});
          }
        );

        it(`should remove ${emptyTypeStr} from middle of array`,
          function () {
            const data = {a: []};
            const patch = {a: ['foo', emptyType, 'bar']};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: ['foo', 'bar']});
          }
        );

        it(`should remove ${emptyTypeStr} from end of array`,
          function () {
            const data = {a: []};
            const patch = {a: ['foo', 'bar', emptyType]};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: ['foo', 'bar']});
          }
        );

        //
        // Source arrays are never optimized
        //

        it(`should keep ${emptyTypeStr} in beginning of source array`,
          function () {
            const data = {a: [emptyType, 'foo', 'bar']};
            const patch = {};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: [emptyType, 'foo', 'bar']});
          }
        );

        it(`should keep ${emptyTypeStr} in middle of source array`,
          function () {
            const data = {a: ['foo', emptyType, 'bar']};
            const patch = {};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: ['foo', emptyType, 'bar']});
          }
        );

        it(`should keep ${emptyTypeStr} in end of source array`,
          function () {
            const data = {a: ['foo', 'bar', emptyType]};
            const patch = {};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: ['foo', 'bar', emptyType]});
          }
        );

        //
        // Source empty values are kept when patching on top of them
        //

        it(`should keep ${emptyTypeStr} in beginning when mixing arrays`,
          function () {
            const data = {a: ['foo', emptyType, 'bar']};
            const patch = {a: [emptyType, emptyType, 'bar']};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: [emptyType, 'bar']});
          }
        );

        it(`should keep ${emptyTypeStr} in middle when mixing arrays`,
          function () {
            const data = {a: [emptyType, 'foo', 'bar']};
            const patch = {a: [emptyType, emptyType, 'bar']};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: [emptyType, 'bar']});
          }
        );

        it(`should keep ${emptyTypeStr} in end when mixing arrays`,
          function () {
            const data = {a: ['foo', 'bar', emptyType]};
            const patch = {a: [emptyType, 'bar', emptyType]};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: ['bar', emptyType]});
          }
        );

      });

    });

    describe('Data Source Preference', function () {

      //
      // If the source value is null/undefined whatever type is given it should
      // replace it.
      //

      [undefined, null].forEach(function (nullType) {
        const nullTypeStr = JSON.stringify(nullType);

        VALUE_TYPES.forEach(function (valueType) {
          const valueTypeStr = JSON.stringify(valueType);

          it(`should prefer ${valueTypeStr} if source value is ${nullTypeStr}`,
            function () {
              const data = nullType;
              const patch = {foo: valueType};
              const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
              expect(patched).toEqual({foo: valueType});
            }
          );

        });

      });

      //
      // If we are mixing types, always prefer the source type
      //

      VALUE_TYPES.forEach(function (typeA) {
        const typeAStr = JSON.stringify(typeA);

        VALUE_TYPES.reverse().forEach(function (typeB) {
          const typeBStr = JSON.stringify(typeB);

          it(`should perserve original type ${typeAStr} when ${typeBStr} given`,
            function () {
              const data = {a: typeA};
              const patch = {a: typeB};
              const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
              expect(patched).toEqual({a: typeA});
            }
          );

        });

      });

    });

    describe('Value Removal', function () {
      EMPTY_TYPES.forEach(function (emptyType) {
        const emptyTypeStr = JSON.stringify(emptyType);

        //
        // Empty properties and empty objects should be removed
        // from the patch before they are applied to the source
        //

        it(`should remove ${emptyTypeStr} along with empty deep objects`,
          function () {
            const data = {a: {}};
            const patch = {a: {b: {c: {d: {emptyType}}}}};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: {}});
          }
        );

        it(`should remove ${emptyTypeStr} along with empty deep arrays`,
          function () {
            const data = {a: []};
            const patch = {a: [[emptyType, emptyType, [emptyType, [emptyType]]]]};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: []});
          }
        );

        it(`should remove ${emptyTypeStr} along with mixed empty structures`,
          function () {
            const data = {a: []};
            const patch = {a: [{b: emptyType}, [emptyType, {c: emptyType}]]};
            const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
            expect(patched).toEqual({a: []});
          }
        );

        //
        // Specifying an empty value to an existing non-empty property
        // should result to it's removal
        //

        VALUE_TYPES.forEach(function (valueType) {
          const valueTypeStr = JSON.stringify(valueType);

          it(`should remove ${emptyTypeStr} on ${valueTypeStr}`,
            function () {
              const data = {a: valueType};
              const patch = {a: emptyType};
              const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
              expect(patched).toEqual({});
            }
          );

          it(`should remove ${emptyTypeStr} on ${valueTypeStr} in array`,
            function () {
              const data = {a: [valueType, valueType]};
              const patch = {a: [valueType, emptyType, valueType]};
              const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
              expect(patched).toEqual({a: [valueType, valueType]});
            }
          );

          it(`should remove ${emptyTypeStr} on ${valueTypeStr} in object`,
            function () {
              const data = {a: {b: valueType, c: 'value'}};
              const patch = {a: {b: emptyType, c: 'value'}};
              const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
              expect(patched).toEqual({a: {c: 'value'}});
            }
          );

          it(`should remove ${emptyTypeStr} on ${valueTypeStr} in object in array`,
            function () {
              const data = {a: [{b: valueType, c: 'value'}, {d: 'other'}]};
              const patch = {a: [{b: emptyType, c: 'value'}, {d: 'other'}]};
              const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
              expect(patched).toEqual({a: [{c: 'value'}, {d: 'other'}]});
            }
          );

          it(`should remove ${emptyTypeStr} on ${valueTypeStr} in array in object`,
            function () {
              const data = {a: {b: [valueType, 'value']}};
              const patch = {a: {b: [emptyType, 'value']}};
              const patched = CreateServiceModalFormUtil.applyPatch(data, patch);
              expect(patched).toEqual({a: {b: ['value']}});
            }
          );

        });
      });
    });
  });
});

