jest.dontMock("../../utils/LocalStorageUtil");
jest.dontMock("../UserSettingsStore");

const LocalStorageUtil = require("../../utils/LocalStorageUtil");
const UserSettingsStore = require("../UserSettingsStore");

describe("UserSettingsStore", function() {
  beforeEach(function() {
    this.prevGet = LocalStorageUtil.get;

    LocalStorageUtil.get = function() {
      return JSON.stringify({ hello: "there" });
    };
  });

  afterEach(function() {
    LocalStorageUtil.get = this.prevGet;
  });

  describe("getKey", function() {
    it("returns the correct value", function() {
      var result = UserSettingsStore.getKey("hello");
      expect(result).toEqual("there");
    });

    it("returns undefined if key doesn't exist", function() {
      var result = UserSettingsStore.getKey("doesNotExist");
      expect(result).toEqual(undefined);
    });
  });

  describe("setKey", function() {
    beforeEach(function() {
      this.prevSet = LocalStorageUtil.set;

      LocalStorageUtil.set = jasmine.createSpy();
    });

    afterEach(function() {
      LocalStorageUtil.set = this.prevSet;
    });

    it("sets the key", function() {
      UserSettingsStore.setKey("boom", "ski");
      expect(LocalStorageUtil.set).toHaveBeenCalledWith(
        "dcosUserSettings",
        JSON.stringify({ hello: "there", boom: "ski" })
      );
    });
  });
});
