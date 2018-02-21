const NavigationService = require("../NavigationService");

let thisInstance;

describe("NavigationService", function() {
  beforeEach(function() {
    thisInstance = new NavigationService();
  });

  describe("#registerCategory", function() {
    it("registers a category", function() {
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

  describe("#registerPrimary", function() {
    it("registers a primary nav", function() {
      thisInstance.registerPrimary("/test", "Test", { category: "root" });

      expect(thisInstance.getDefinition()).toEqual([
        {
          category: "root",
          children: [
            {
              path: "/test",
              link: "Test",
              options: { category: "root" },
              children: []
            }
          ]
        }
      ]);
    });
  });

  describe("#registerSecondary", function() {
    it("registers a secondary nav", function() {
      thisInstance.registerPrimary("/test", "Test");
      thisInstance.registerSecondary("/test", "path", "Test Path");

      expect(thisInstance.getDefinition()).toEqual([
        {
          category: "root",
          children: [
            {
              path: "/test",
              link: "Test",
              options: {},
              children: [
                {
                  link: "Test Path",
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

  describe("deferred registration", function() {
    it("defers registration until all dependencies are resolved", function() {
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
              link: "Test",
              options: { category: "test" },
              children: [
                {
                  link: "Test Path",
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
