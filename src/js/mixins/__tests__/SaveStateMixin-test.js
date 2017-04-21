jest.dontMock("../SaveStateMixin");
jest.dontMock("../../stores/UserSettingsStore");

const SaveStateMixin = require("../SaveStateMixin");
const UserSettingsStore = require("../../stores/UserSettingsStore");

describe("SaveStateMixin", function() {
  beforeEach(function() {
    this.instance = Object.assign(
      {
        saveState_key: "fakeInstance",
        setState: jasmine.createSpy()
      },
      SaveStateMixin
    );

    this.instance.constructor.displayName = "FakeInstance";
  });

  describe("#componentWillMount", function() {
    beforeEach(function() {
      this.prevGetKey = UserSettingsStore.getKey;
      UserSettingsStore.getKey = function() {
        return {
          fakeInstance: {
            open: false
          }
        };
      };
    });

    afterEach(function() {
      UserSettingsStore.getKey = this.prevGetKey;
    });

    it("should set the previous state", function() {
      this.instance.componentWillMount();
      expect(this.instance.setState).toHaveBeenCalledWith({ open: false });
    });
  });

  describe("#componentWillUnmount", function() {
    it("should call #saveState_save", function() {
      this.instance.saveState_save = jasmine.createSpy();
      this.instance.componentWillUnmount();
      expect(this.instance.saveState_save).toHaveBeenCalled();
    });
  });

  describe("#saveState_save", function() {
    beforeEach(function() {
      this.prevGetKey = UserSettingsStore.getKey;
      this.prevSetKey = UserSettingsStore.setKey;

      UserSettingsStore.getKey = function() {
        return {
          fakeInstance: {
            open: false
          }
        };
      };
      UserSettingsStore.setKey = jasmine.createSpy();
    });

    afterEach(function() {
      UserSettingsStore.getKey = this.prevGetKey;
      UserSettingsStore.setKey = this.prevSetKey;
    });

    it("should not save any state", function() {
      this.instance.state = { open: false, errorCount: 9001 };
      this.instance.saveState_save();
      expect(UserSettingsStore.setKey).not.toHaveBeenCalled();
    });

    it("should set the previous state", function() {
      this.instance.saveState_properties = ["open", "errorCount"];
      this.instance.state = { open: false, errorCount: 9001 };
      this.instance.saveState_save();
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith("savedStates", {
        fakeInstance: { open: false, errorCount: 9001 }
      });
    });

    it("should save specified keys", function() {
      this.instance.saveState_properties = ["errorCount"];
      this.instance.state = { open: false, errorCount: 9001 };
      this.instance.saveState_save();
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith("savedStates", {
        fakeInstance: { errorCount: 9001 }
      });
    });
  });
});
