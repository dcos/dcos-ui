const NavigationService = require("../NavigationService");

let thisInstance;

describe("NavigationService", () => {
  beforeEach(() => {
    thisInstance = new NavigationService();
  });

  describe("#registerCategory", () => {
    it("registers a category", () => {
      thisInstance.registerCategory("test");

      expect(thisInstance.getDefinition()).toEqual([
        { category: "root", children: [] },
        {
          category: "test",
          children: []
        }
      ]);
    });
  });

  describe("#registerPrimary", () => {
    it("registers a primary nav", () => {
      thisInstance.registerPrimary("/test", "Test", { category: "root" });

      expect(thisInstance.getDefinition()).toEqual([
        {
          category: "root",
          children: [
            {
              path: "/test",
              label: "Test",
              options: { category: "root" },
              children: []
            }
          ]
        }
      ]);
    });
  });

  describe("#registerSecondary", () => {
    it("registers a secondary nav", () => {
      thisInstance.registerPrimary("/test", "Test");
      thisInstance.registerSecondary("/test", "path", "Test Path");

      expect(thisInstance.getDefinition()).toEqual([
        {
          category: "root",
          children: [
            {
              path: "/test",
              label: "Test",
              options: {},
              children: [
                {
                  label: "Test Path",
                  path: "/test/path",
                  children: [],
                  options: {}
                }
              ]
            }
          ]
        }
      ]);
    });
  });

  describe("deferred registration", () => {
    it("defers registration until all dependencies are resolved", () => {
      thisInstance.registerSecondary("/test", "path", "Test Path", {
        category: "test"
      });
      thisInstance.registerPrimary("/test", "Test", { category: "test" });
      thisInstance.registerCategory("test");

      expect(thisInstance.getDefinition()).toEqual([
        { category: "root", children: [] },
        {
          category: "test",
          children: [
            {
              path: "/test",
              label: "Test",
              options: { category: "test" },
              children: [
                {
                  label: "Test Path",
                  path: "/test/path",
                  children: [],
                  options: { category: "test" }
                }
              ]
            }
          ]
        }
      ]);
    });
  });
});
