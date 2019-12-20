import RoutingService from "../RoutingService";

const ReactRouter = require("react-router");

let thisInstance;

describe("RoutingService", () => {
  beforeEach(() => {
    thisInstance = new RoutingService();
  });

  describe("#registerRedirect", () => {
    it("registers Redirect", () => {
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

  describe("#registerPage", () => {
    it("registers Page", () => {
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

  describe("#registerTab", () => {
    it("registers Tab", () => {
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

  describe("override protection", () => {
    describe("#registerRedirect", () => {
      it("does not add a duplicate Redirect", () => {
        thisInstance.registerRedirect("test", "testB");

        expect(() => {
          thisInstance.registerRedirect("test", "stage");
        }).toThrow(
          new Error("Attempt to override Redirect of test from testB to stage!")
        );
      });
    });

    describe("#registerPage", () => {
      it("throws on an attempt to override a page with a different component", () => {
        thisInstance.registerPage("test", Object);

        expect(() => {
          thisInstance.registerPage("test", Array);
        }).toThrow(new Error("Attempt to override a page at test!"));
      });
    });

    describe("#registerTab", () => {
      it("throws on an attempt to override a Tab", () => {
        thisInstance.registerPage("/test", Object);

        thisInstance.registerTab("/test", "path", Object);

        expect(() => {
          thisInstance.registerTab("/test", "path", Array);
        }).toThrow(new Error("Attempt to override a tab at /test/path!"));
      });
    });
  });
});
