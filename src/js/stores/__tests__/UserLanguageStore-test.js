const UserSettingsStore = require("../UserSettingsStore");
const UserLanguageStore = require("../UserLanguageStore");
const savedStateKey = require("../../constants/UserSettings").SAVED_STATE_KEY;

describe("UserLanguageStore", function() {
  describe("get", function() {
    it("returns en by default", function() {
      expect(UserLanguageStore.get()).toEqual("en");
    });

    it("returns set language", function() {
      UserLanguageStore.set("zh");
      expect(UserLanguageStore.get()).toEqual("zh");
    });
  });

  describe("set", function() {
    it("sets language", function() {
      UserSettingsStore.setKey = jasmine.createSpy();
      UserLanguageStore.set("zh");
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith(savedStateKey, {
        language: "zh"
      });
    });
  });
});
