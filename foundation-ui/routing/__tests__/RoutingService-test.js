jest.dontMock("../RoutingService");
const RoutingService = require("../RoutingService");
const ReactRouter = require("react-router");

describe("RoutingService", function() {
  beforeEach(function() {
    this.instance = new RoutingService();
  });

  describe("#registerRedirect", function() {
    it("registers Redirect", function() {
      this.instance.registerRedirect("/test", "/stage");

      expect(this.instance.getDefinition()).toEqual([
        {
          path: "/test",
          to: "/stage",
          type: ReactRouter.Redirect
        }
      ]);
    });
  });

  describe("#registerPage", function() {
    it("registers Page", function() {
      this.instance.registerPage("/test", Object);

      expect(this.instance.getDefinition()).toEqual([
        {
          path: "/test",
          component: Object,
          type: ReactRouter.Route
        }
      ]);
    });
  });

  describe("#registerTab", function() {
    it("registers Tab", function() {
      this.instance.registerPage("/test", Object);
      this.instance.registerTab("/test", "path", Object);

      expect(this.instance.getDefinition()).toEqual([
        {
          path: "/test",
          component: Object,
          type: ReactRouter.Route,
          children: [
            {
              path: "path",
              component: Object,
              type: ReactRouter.Route
            }
          ]
        }
      ]);
    });
  });

  describe("override protection", function() {
    describe("#registerRedirect", function() {
      it("does not add a duplicate Redirect", function() {
        this.instance.registerRedirect("test", "testB");

        expect(() => {
          this.instance.registerRedirect("test", "stage");
        }).toThrow(
          new Error("Attempt to override Redirect of test from testB to stage!")
        );
      });
    });

    describe("#registerPage", function() {
      it("throws on an attempt to override a page with a different component", function() {
        this.instance.registerPage("test", Object);

        expect(() => {
          this.instance.registerPage("test", Array);
        }).toThrow(new Error("Attempt to override a page at test!"));
      });
    });

    describe("#registerTab", function() {
      it("throws on an attempt to override a Tab", function() {
        this.instance.registerPage("/test", Object);

        this.instance.registerTab("/test", "path", Object);

        expect(() => {
          this.instance.registerTab("/test", "path", Array);
        }).toThrow(new Error("Attempt to override a tab at /test/path!"));
      });
    });
  });
});
