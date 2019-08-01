import UserSettingsStore from "../UserSettingsStore";
import LocalStorageUtil from "../../utils/LocalStorageUtil";

let thisPrevGet, thisPrevSet;

describe("UserSettingsStore", function() {
  beforeEach(function() {
    thisPrevGet = LocalStorageUtil.get;

    LocalStorageUtil.get = function() {
      return JSON.stringify({ hello: "there" });
    };
  });

  afterEach(function() {
    LocalStorageUtil.get = thisPrevGet;
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
      thisPrevSet = LocalStorageUtil.set;

      LocalStorageUtil.set = jasmine.createSpy();
    });

    afterEach(function() {
      LocalStorageUtil.set = thisPrevSet;
    });

    it("sets the key", function() {
      UserSettingsStore.setKey("boom", "ski");
      expect(LocalStorageUtil.set).toHaveBeenCalledWith(
        "dcosUserSettings",
        JSON.stringify({ hello: "there", boom: "ski" })
      );
    });
  });

  describe("setJSONEditorExpandedSetting", function() {
    beforeEach(function() {
      thisPrevSet = LocalStorageUtil.set;

      LocalStorageUtil.get = function() {
        return JSON.stringify({});
      };
      LocalStorageUtil.set = jasmine.createSpy();
    });

    afterEach(function() {
      LocalStorageUtil.set = thisPrevSet;
    });

    it("sets the JSONEditor key to true", function() {
      UserSettingsStore.setJSONEditorExpandedSetting(true);
      expect(LocalStorageUtil.set).toHaveBeenCalledWith(
        "dcosUserSettings",
        JSON.stringify({ JSONEditor: { expanded: true } })
      );
    });

    it("sets the JSONEditor key to false", function() {
      UserSettingsStore.setJSONEditorExpandedSetting(false);
      expect(LocalStorageUtil.set).toHaveBeenCalledWith(
        "dcosUserSettings",
        JSON.stringify({ JSONEditor: { expanded: false } })
      );
    });
  });

  describe("get JSONEditorExpandedSetting", function() {
    it("returns false if undefined in localStorage", function() {
      LocalStorageUtil.get = function() {
        return JSON.stringify({});
      };
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(false);
    });
    it("returns false if expended is undefined in localStorage", function() {
      LocalStorageUtil.get = function() {
        return JSON.stringify({ JSONEditor: {} });
      };
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(false);
    });

    it("returns false if false in localStorage", function() {
      LocalStorageUtil.get = function() {
        return JSON.stringify({ JSONEditor: { expanded: false } });
      };
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(false);
    });

    it("returns true if true in localStorage", function() {
      LocalStorageUtil.get = function() {
        return JSON.stringify({ JSONEditor: { expanded: true } });
      };
      expect(UserSettingsStore.JSONEditorExpandedSetting).toEqual(true);
    });
  });
});
