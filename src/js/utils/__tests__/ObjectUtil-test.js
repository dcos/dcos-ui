const ObjectUtil = require('../ObjectUtil');

describe('ObjectUtil', function () {

  describe('#markObject', function () {

    it('should properly mark an object', function () {
      let obj = {};
      let mark = 'mark';

      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });

    it('should properly overwrite previous mark', function () {
      let obj = {};
      let previousMark = 'mork';
      let mark = 'mark';

      ObjectUtil.markObject(obj, previousMark);
      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });

  });

  describe('#objectHasMark', function () {

    it('should return false on unmarked objects', function () {
      let obj = {};
      let mark = 'mark';
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it('should return true on correctly marked objects', function () {
      let obj = {};
      let mark = 'mark';

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });

    it('should return false on wrongly marked objects', function () {
      let obj = {};
      let mark = 'mark';
      let wrongMark = 'mork';

      ObjectUtil.markObject(obj, wrongMark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it('should correctly handle objects as marks', function () {
      let obj = {};
      let mark = {};
      let wrongMark = {};

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, wrongMark)).toBeFalsy();
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });

  });

});
