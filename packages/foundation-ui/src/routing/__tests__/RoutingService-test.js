const RoutingService = require("../RoutingService");
const ReactRouter = require("react-router");

let thisInstance;

describe("RoutingService", function() {
  beforeEach(function() {
    thisInstance = new RoutingService();
  });

  describe("#registerRedirect", function() {
    it("registers Redirect", function() {
      thisInstance.registerRedirect("/test", "/stage");

      expect(thisInstance.getDefinition()).toEqual([
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
      thisInstance.registerPage("/test", Object);

      expect(thisInstance.getDefinition()).toEqual([
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
      thisInstance.registerPage("/test", Object);
      thisInstance.registerTab("/test", "path", Object);

      expect(thisInstance.getDefinition()).toEqual([
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
        thisInstance.registerRedirect("test", "testB");

        expect(() => {
          thisInstance.registerRedirect("test", "stage");
        }).toThrow(
          new Error("Attempt to override Redirect of test from testB to stage!")
        );
      });
    });

    describe("#registerPage", function() {
      it("throws on an attempt to override a page with a different component", function() {
        thisInstance.registerPage("test", Object);

        expect(() => {
          thisInstance.registerPage("test", Array);
        }).toThrow(new Error("Attempt to override a page at test!"));
      });
    });

    describe("#registerTab", function() {
      it("throws on an attempt to override a Tab", function() {
        thisInstance.registerPage("/test", Object);

        thisInstance.registerTab("/test", "path", Object);

        expect(() => {
          thisInstance.registerTab("/test", "path", Array);
        }).toThrow(new Error("Attempt to override a tab at /test/path!"));
      });
    });
  });
});
