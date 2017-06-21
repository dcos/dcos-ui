jest.dontMock("../Breadcrumbs");

const Breadcrumbs = require("../Breadcrumbs");

describe("Breadcrumbs", function() {
  beforeEach(function() {
    this.instance = new Breadcrumbs();
  });

  describe("#findRoute", function() {
    it("finds a nested route", function() {
      const routes = [
        {
          path: "some",
          childRoutes: [
            {
              path: ":deep",
              childRoutes: [
                {
                  path: "route"
                }
              ]
            }
          ]
        }
      ];
      const segments = ["some", ":deep", "route"];
      const route = this.instance.findRoute(segments, routes);

      expect(route).toEqual({
        path: "route"
      });
    });

    it("works with a wrapper route (route with no path)", function() {
      const routes = [
        {
          path: "some",
          childRoutes: [
            {
              childRoutes: [
                {
                  path: ":deep/route"
                }
              ]
            }
          ]
        }
      ];
      const segments = ["some", ":deep", "route"];
      const route = this.instance.findRoute(segments, routes);

      expect(route).toEqual({
        path: ":deep/route"
      });
    });

    it("checks all the leafs", function() {
      const routes = [
        {
          path: "some",
          childRoutes: [
            {
              path: ":deep",
              childRoutes: [
                {
                  path: "test"
                }
              ]
            },
            {
              path: ":deep/route"
            }
          ]
        }
      ];
      const segments = ["some", ":deep", "route"];
      const route = this.instance.findRoute(segments, routes);

      expect(route).toEqual({
        path: ":deep/route"
      });
    });

    it("skips redirects", function() {
      const routes = [
        {
          path: "some",
          childRoutes: [
            { path: ":deep", to: "/some/:deep/route" },
            {
              path: ":deep/route"
            }
          ]
        }
      ];
      const segments = ["some", ":deep", "route"];
      const route = this.instance.findRoute(segments, routes);

      expect(route).toEqual({
        path: ":deep/route"
      });
    });

    it("works with crazy definitions", function() {
      const routes = [
        {
          path: "some",
          childRoutes: [
            { path: ":deep", to: "/some/:deep/route" },
            {
              path: ":deep",
              childRoutes: [{ path: "test" }, { path: "boo" }]
            },
            { path: ":deep/test/path" },
            {
              path: ":deep/test",
              childRoutes: [{ path: "needle" }]
            }
          ]
        }
      ];
      const segments = ["some", ":deep", "test", "needle"];
      const route = this.instance.findRoute(segments, routes);

      expect(route).toEqual({
        path: "needle"
      });
    });
  });
});
