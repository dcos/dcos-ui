const ObjectUtil = require("../ObjectUtil");

describe("ObjectUtil", () => {
  describe("#markObject", () => {
    it("marks an object", () => {
      const obj = {};
      const mark = "mark";

      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });

    it("overwrites previous mark", () => {
      const obj = {};
      const previousMark = "mork";
      const mark = "mark";

      ObjectUtil.markObject(obj, previousMark);
      ObjectUtil.markObject(obj, mark);
      expect(obj.___object_mark___).toEqual(mark);
    });
  });

  describe("#objectHasMark", () => {
    it("returns false on unmarked objects", () => {
      const obj = {};
      const mark = "mark";
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it("returns true on correctly marked objects", () => {
      const obj = {};
      const mark = "mark";

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });

    it("returns false on wrongly marked objects", () => {
      const obj = {};
      const mark = "mark";
      const wrongMark = "mork";

      ObjectUtil.markObject(obj, wrongMark);
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeFalsy();
    });

    it("handles objects as marks", () => {
      const obj = {};
      const mark = {};
      const wrongMark = {};

      ObjectUtil.markObject(obj, mark);
      expect(ObjectUtil.objectHasMark(obj, wrongMark)).toBeFalsy();
      expect(ObjectUtil.objectHasMark(obj, mark)).toBeTruthy();
    });
  });
});
