jest.dontMock("../NavigationService");
const NavigationService = require("../NavigationService");

describe("NavigationService", function() {
  beforeEach(function() {
    this.instance = new NavigationService();
  });

  describe("#registerCategory", function() {
    it("registers a category", function() {
      this.instance.registerCategory("test");

      expect(this.instance.getDefinition()).toEqual([
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
      this.instance.registerPrimary("/test", "Test", { category: "root" });

      expect(this.instance.getDefinition()).toEqual([
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
      this.instance.registerPrimary("/test", "Test");
      this.instance.registerSecondary("/test", "path", "Test Path");

      expect(this.instance.getDefinition()).toEqual([
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
      this.instance.registerSecondary("/test", "path", "Test Path", {
        category: "test"
      });
      this.instance.registerPrimary("/test", "Test", { category: "test" });
      this.instance.registerCategory("test");

      expect(this.instance.getDefinition()).toEqual([
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
