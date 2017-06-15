jest.dontMock("../LocalStorageUtil");

const LocalStorageUtil = require("../LocalStorageUtil");

describe("LocalStorageUtil", function() {
  beforeEach(function() {
    global.localStorage.clear();
  });

  describe("#get", function() {
    it("should get value from localStorage", function() {
      global.localStorage.setItem("foo", "bar");
      expect(LocalStorageUtil.get("foo")).toEqual("bar");
    });

    it("does not mutate", function() {
      global.localStorage.setItem("foo", "bar");
      LocalStorageUtil.get("foo");

      expect(LocalStorageUtil.get("foo")).toEqual("bar");
    });
  });

  describe("#set", function() {
    it("should get value from localStorage", function() {
      LocalStorageUtil.set("foo", "bar");
      expect(LocalStorageUtil.get("foo")).toEqual("bar");
    });
  });
});
