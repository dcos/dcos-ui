const InternalStorageMixin = require("../InternalStorageMixin");

let thisInstance;

describe("InternalStorageMixin", function() {
  beforeEach(function() {
    thisInstance = Object.assign({}, InternalStorageMixin);
    thisInstance.constructor.displayName = "FakeInstance";
  });

  describe("#internalStorage_get", function() {
    it("returns an empty object", function() {
      var instance = thisInstance;

      expect(instance.internalStorage_get()).toEqual({});
    });

    it("gets the last set object", function() {
      var instance = thisInstance;

      instance.internalStorage_set({
        a: 1,
        b: 2,
        c: 3
      });

      instance.internalStorage_set({
        a: "a",
        b: "b"
      });

      expect(instance.internalStorage_get()).toEqual({
        a: "a",
        b: "b"
      });
    });

    it("gets the last set value", function() {
      var instance = thisInstance;

      instance.internalStorage_set("teststring");
      instance.internalStorage_set("second teststring");

      expect(instance.internalStorage_get()).toBe("second teststring");
    });

    it("gets the updated object", function() {
      var instance = thisInstance;

      instance.internalStorage_set({
        a: 1,
        b: 2,
        c: 3
      });

      instance.internalStorage_update({
        a: "a",
        b: "b"
      });

      instance.internalStorage_update({});
      instance.internalStorage_update(null);

      expect(instance.internalStorage_get()).toEqual({
        a: "a",
        b: "b",
        c: 3
      });
    });
  });

  describe("#internalStorage_update", function() {
    it("throws an error while try to update a non Object/Array", function() {
      var instance = thisInstance;

      instance.internalStorage_set("teststring");

      var fn = instance.internalStorage_update.bind(instance, {
        a: "a",
        b: "b"
      });

      expect(fn).toThrow();
    });
  });
});
