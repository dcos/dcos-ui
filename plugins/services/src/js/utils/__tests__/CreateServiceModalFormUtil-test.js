const CreateServiceModalFormUtil = require('../CreateServiceModalFormUtil');

const EMPTY_TYPES = [null, undefined, {}, [], '', NaN];

function getTypeName(type) {
  if (Number.isNaN(type)) {
    return 'NaN';
  }

  return JSON.stringify(type);
}

describe('CreateServiceModalFormUtil', function () {
  describe('#stripEmptyProperties', function () {
    EMPTY_TYPES.forEach(function (emptyType) {
      const emptyTypeStr = getTypeName(emptyType);

      it(`should remove ${emptyTypeStr} object properties`, function () {
        const data = {a: 'foo', b: emptyType};
        const clean = CreateServiceModalFormUtil.stripEmptyProperties(data);
        expect(clean).toEqual({a: 'foo'});
      });

      it(`should remove ${emptyTypeStr} array items`, function () {
        const data = ['foo', emptyType];
        const clean = CreateServiceModalFormUtil.stripEmptyProperties(data);
        expect(clean).toEqual(['foo']);
      });
    });
  });

});
