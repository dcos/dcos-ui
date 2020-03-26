import UserSettingsStore from "../UserSettingsStore";
import UserLanguageStore from "../UserLanguageStore";
import { SAVED_STATE_KEY } from "../../constants/UserSettings";

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
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith(SAVED_STATE_KEY, {
        language: "zh",
      });
    });
  });
});
