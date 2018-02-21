const SaveStateMixin = require("../SaveStateMixin");
const UserSettingsStore = require("../../stores/UserSettingsStore");

let thisInstance, thisPrevGetKey, thisPrevSetKey;

describe("SaveStateMixin", function() {
  beforeEach(function() {
    thisInstance = Object.assign(
      {
        saveState_key: "fakeInstance",
        setState: jasmine.createSpy()
      },
      SaveStateMixin
    );

    thisInstance.constructor.displayName = "FakeInstance";
  });

  describe("#componentWillMount", function() {
    beforeEach(function() {
      thisPrevGetKey = UserSettingsStore.getKey;
      UserSettingsStore.getKey = function() {
        return {
          fakeInstance: {
            open: false
          }
        };
      };
    });

    afterEach(function() {
      UserSettingsStore.getKey = thisPrevGetKey;
    });

    it("sets the previous state", function() {
      thisInstance.componentWillMount();
      expect(thisInstance.setState).toHaveBeenCalledWith({ open: false });
    });
  });

  describe("#componentWillUnmount", function() {
    it("calls #saveState_save", function() {
      thisInstance.saveState_save = jasmine.createSpy();
      thisInstance.componentWillUnmount();
      expect(thisInstance.saveState_save).toHaveBeenCalled();
    });
  });

  describe("#saveState_save", function() {
    beforeEach(function() {
      thisPrevGetKey = UserSettingsStore.getKey;
      thisPrevSetKey = UserSettingsStore.setKey;

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
      UserSettingsStore.getKey = thisPrevGetKey;
      UserSettingsStore.setKey = thisPrevSetKey;
    });

    it("does not save any state", function() {
      thisInstance.state = { open: false, errorCount: 9001 };
      thisInstance.saveState_save();
      expect(UserSettingsStore.setKey).not.toHaveBeenCalled();
    });

    it("sets the previous state", function() {
      thisInstance.saveState_properties = ["open", "errorCount"];
      thisInstance.state = { open: false, errorCount: 9001 };
      thisInstance.saveState_save();
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith("savedStates", {
        fakeInstance: { open: false, errorCount: 9001 }
      });
    });

    it("saves specified keys", function() {
      thisInstance.saveState_properties = ["errorCount"];
      thisInstance.state = { open: false, errorCount: 9001 };
      thisInstance.saveState_save();
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith("savedStates", {
        fakeInstance: { errorCount: 9001 }
      });
    });
  });
});
