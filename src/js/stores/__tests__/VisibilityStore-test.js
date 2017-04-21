jest.dontMock("../VisibilityStore");

const VISIBILITY_CHANGE = require("../../constants/EventTypes")
  .VISIBILITY_CHANGE;
const VisibilityStore = require("../VisibilityStore");

describe("VisibilityStore", function() {
  describe("#emit", function() {
    it("emits the correct event on visibilityChange", function() {
      var mockFn = jest.genMockFunction();
      VisibilityStore.addChangeListener(VISIBILITY_CHANGE, mockFn);
      VisibilityStore.onVisibilityChange();
      expect(mockFn).toBeCalled();
    });
  });

  describe("#isTabVisible", function() {
    it("returns true if tab is visible", function() {
      VisibilityStore.set({ isTabVisible: true });
      expect(VisibilityStore.isTabVisible()).toBeTruthy();
    });
    it("returns false if tab is visible", function() {
      VisibilityStore.set({ isTabVisible: false });
      expect(VisibilityStore.isTabVisible()).toEqual(false);
    });
  });

  describe("#isInactive", function() {
    it("returns true if tab is inactive", function() {
      VisibilityStore.set({ isInactive: true });
      expect(VisibilityStore.isInactive()).toBeTruthy();
    });
    it("returns false if tab is inactive", function() {
      VisibilityStore.set({ isInactive: false });
      expect(VisibilityStore.isInactive()).toEqual(false);
    });
  });
});
