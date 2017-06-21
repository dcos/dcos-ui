const ObjectUtil = require("../ObjectUtil");

describe("ObjectUtil", function() {
  describe("#markObject", function() {
    it("should properly mark an object", function() {
      const obj = {};
      const mark = "mark";

      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });

    it("should properly overwrite previous mark", function() {
      const obj = {};
      const previousMark = "mork";
      const mark = "mark";

      ObjectUtil.markObject(obj, previousMark);
      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });
  });

  describe("#objectHasMark", function() {
    it("should return false on unmarked objects", function() {
      const obj = {};
      const mark = "mark";
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it("should return true on correctly marked objects", function() {
      const obj = {};
      const mark = "mark";

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });

    it("should return false on wrongly marked objects", function() {
      const obj = {};
      const mark = "mark";
      const wrongMark = "mork";

      ObjectUtil.markObject(obj, wrongMark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it("should correctly handle objects as marks", function() {
      const obj = {};
      const mark = {};
      const wrongMark = {};

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, wrongMark)).toBeFalsy();
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });
  });
});
