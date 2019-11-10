const VISIBILITY_CHANGE = require("../../constants/EventTypes")
  .VISIBILITY_CHANGE;
const VisibilityStore = require("../VisibilityStore");

describe("VisibilityStore", () => {
  describe("#emit", () => {
    it("emits the correct event on visibilityChange", () => {
      var mockFn = jest.genMockFunction();
      VisibilityStore.addChangeListener(VISIBILITY_CHANGE, mockFn);
      VisibilityStore.onVisibilityChange();
      expect(mockFn).toBeCalled();
    });
  });

  describe("#isTabVisible", () => {
    it("returns true if tab is visible", () => {
      VisibilityStore.set({ isTabVisible: true });
      expect(VisibilityStore.isTabVisible()).toBeTruthy();
    });
    it("returns false if tab is visible", () => {
      VisibilityStore.set({ isTabVisible: false });
      expect(VisibilityStore.isTabVisible()).toEqual(false);
    });
  });

  describe("#isInactive", () => {
    it("returns true if tab is inactive", () => {
      VisibilityStore.set({ isInactive: true });
      expect(VisibilityStore.isInactive()).toBeTruthy();
    });
    it("returns false if tab is inactive", () => {
      VisibilityStore.set({ isInactive: false });
      expect(VisibilityStore.isInactive()).toEqual(false);
    });
  });
});
