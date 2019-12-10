import UserSettingsStore from "../UserSettingsStore";

import UserLanguageStore from "../UserLanguageStore";

const savedStateKey = require("../../constants/UserSettings").SAVED_STATE_KEY;

describe("UserLanguageStore", () => {
  describe("get", () => {
    it("returns en by default", () => {
      expect(UserLanguageStore.get()).toEqual("en");
    });

    it("returns set language", () => {
      UserLanguageStore.set("zh");
      expect(UserLanguageStore.get()).toEqual("zh");
    });
  });

  describe("set", () => {
    it("sets language", () => {
      UserSettingsStore.setKey = jasmine.createSpy();
      UserLanguageStore.set("zh");
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith(savedStateKey, {
        language: "zh"
      });
    });
  });
});
