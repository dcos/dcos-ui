import UserSettingsStore from "../UserSettingsStore";
import LocalStorageUtil from "../../utils/LocalStorageUtil";

let thisPrevGet, thisPrevSet;

describe("UserSettingsStore", () => {
  beforeEach(() => {
    thisPrevGet = LocalStorageUtil.get;

    LocalStorageUtil.get = () => JSON.stringify({ hello: "there" });
  });

  afterEach(() => {
    LocalStorageUtil.get = thisPrevGet;
  });

  describe("getKey", () => {
    it("returns the correct value", () => {
      const result = UserSettingsStore.getKey("hello");
      expect(result).toEqual("there");
    });

    it("returns undefined if key doesn't exist", () => {
      const result = UserSettingsStore.getKey("doesNotExist");
      expect(result).toEqual(undefined);
    });
  });

  describe("setKey", () => {
    beforeEach(() => {
      thisPrevSet = LocalStorageUtil.set;

      LocalStorageUtil.set = jasmine.createSpy();
    });

    afterEach(() => {
      LocalStorageUtil.set = thisPrevSet;
    });

    it("sets the key", () => {
      UserSettingsStore.setKey("boom", "ski");
      expect(LocalStorageUtil.set).toHaveBeenCalledWith(
        "dcosUserSettings",
        JSON.stringify({ hello: "there", boom: "ski" })
      );
    });
  });

  describe("setJSONEditorExpandedSetting", () => {
    beforeEach(() => {
      thisPrevSet = LocalStorageUtil.set;

      LocalStorageUtil.get = () => JSON.stringify({});
      LocalStorageUtil.set = jasmine.createSpy();
    });

    afterEach(() => {
      LocalStorageUtil.set = thisPrevSet;
    });

    it("sets the JSONEditor key to true", () => {
      UserSettingsStore.setJSONEditorExpandedSetting(true);
      expect(LocalStorageUtil.set).toHaveBeenCalledWith(
        "dcosUserSettings",
        JSON.stringify({ JSONEditor: { expanded: true } })
      );
    });

    it("sets the JSONEditor key to false", () => {
      UserSettingsStore.setJSONEditorExpandedSetting(false);
      expect(LocalStorageUtil.set).toHaveBeenCalledWith(
        "dcosUserSettings",
        JSON.stringify({ JSONEditor: { expanded: false } })
      );
    });
  });

  describe("get JSONEditorExpandedSetting", () => {
    it("returns false if undefined in localStorage", () => {
      LocalStorageUtil.get = () => JSON.stringify({});
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(false);
    });
    it("returns false if expended is undefined in localStorage", () => {
      LocalStorageUtil.get = () => JSON.stringify({ JSONEditor: {} });
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(false);
    });

    it("returns false if false in localStorage", () => {
      LocalStorageUtil.get = () =>
        JSON.stringify({ JSONEditor: { expanded: false } });
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(false);
    });

    it("returns true if true in localStorage", () => {
      LocalStorageUtil.get = () =>
        JSON.stringify({ JSONEditor: { expanded: true } });
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(true);
    });
  });
});
