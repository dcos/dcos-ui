const ReactRouter = require("react-router");
const ReactTestUtils = require("react-addons-test-utils");

const RouterUtil = require("../RouterUtil");

describe("RouterUtil", function() {
  describe("#createComponentsFromRoutes", function() {
    beforeEach(function() {
      this.component = function() {};
    });

    it("creates a react component", function() {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: "foo",
          component: this.component
        }
      ]);

      expect(ReactTestUtils.isElement(components[0])).toBeTruthy();
    });

    it("creates a react component of correct type", function() {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: "foo",
          component: this.component
        }
      ]);

      expect(
        ReactTestUtils.isElementOfType(components[0], ReactRouter.Route)
      ).toBeTruthy();
    });

    it("sets props correctly", function() {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: "foo",
          component: this.component
        }
      ]);
      const props = components[0].props;

      expect(props.component).toEqual(this.component);
      expect(props.path).toEqual("foo");
    });

    it("creates child route components", function() {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: "foo",
          component: this.component,
          children: [
            {
              type: ReactRouter.Redirect,
              path: "bar",
              to: "baz"
            }
          ]
        }
      ]);
      const component = components[0].props.children;

      expect(
        ReactTestUtils.isElementOfType(component, ReactRouter.Redirect)
      ).toBeTruthy();
    });
  });

  describe("#buildRoutes", function() {
    it("builds routes correctly", function() {
      const routeConfiguration = [
        {
          type: ReactRouter.Route,
          path: "foo",
          component() {},
          children: [
            {
              type: ReactRouter.Route,
              path: "bar",
              component() {},
              children: [
                {
                  type: ReactRouter.Route,
                  path: "baz",
                  component() {}
                }
              ]
            }
          ]
        }
      ];

      const routes = RouterUtil.buildRoutes(routeConfiguration);

      // Check first route
      const firstRoute = routes[0];
      expect(firstRoute.path).toEqual("foo");
      expect(firstRoute.component).toEqual(routeConfiguration[0].component);
      expect(firstRoute.buildBreadCrumb).toEqual(
        routeConfiguration[0].buildBreadCrumb
      );
      // Check middle route
      const secondRoute = routes[0].childRoutes[0];
      const secondRouteConfig = routeConfiguration[0].children[0];
      expect(secondRoute.path).toEqual("bar");
      expect(secondRoute.component).toEqual(secondRouteConfig.component);
      expect(secondRoute.buildBreadCrumb).toEqual(undefined);
      // Check last route
      const thirdRoute = routes[0].childRoutes[0].childRoutes[0];
      const thirdRouteConfig = routeConfiguration[0].children[0].children[0];
      expect(thirdRoute.path).toEqual("baz");
      expect(thirdRoute.component).toEqual(thirdRouteConfig.component);
      expect(thirdRoute.buildBreadCrumb).toEqual(
        thirdRouteConfig.buildBreadCrumb
      );
    });
  });

  describe("#reconstructPathFromRoutes", function() {
    it("constructs path correctly", function() {
      const routes = [{ path: "foo" }, { path: ":id" }, { path: ":bar/baz" }];
      const path = RouterUtil.reconstructPathFromRoutes(routes);
      expect(path).toEqual("/foo/:id/:bar/baz");
    });
  });

  describe("#getCorrectedFilePathRoute", function() {
    it("does not augment the path if there is a :filePath placeholder", function() {
      expect(
        RouterUtil.getCorrectedFileRoutePath(
          "/services/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))"
        )
      ).toBe(
        "/services/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))"
      );
    });

    it("does augment the path without a / if there is no placeholder", function() {
      expect(
        RouterUtil.getCorrectedFileRoutePath(
          "/services/detail/:id/tasks/:taskID/files/view"
        )
      ).toBe("/services/detail/:id/tasks/:taskID/files/view/:filePath");
    });

    it("does augment the path with a / if there is no placeholder and no /", function() {
      expect(
        RouterUtil.getCorrectedFileRoutePath(
          "/services/detail/:id/tasks/:taskID/files/view/"
        )
      ).toBe("/services/detail/:id/tasks/:taskID/files/view/:filePath");
    });
  });

  describe("#redirect", function() {
    beforeEach(function() {
      const searchQuery = "?redirect=http://www.google.com/&something=foo";

      // Overwrite jsdom global/window location mock
      Object.defineProperty(global.location, "hostname", {
        writable: true,
        value: "localhost"
      });

      Object.defineProperty(global.location, "href", {
        writable: true,
        value: "http://localhost:4200/#/login?relativePath=/services/detail/%2Fmlancaster/configuration"
      });

      // Overwrite jsdom global/window location mock
      Object.defineProperty(global.location, "search", {
        writable: true,
        value: searchQuery
      });
    });

    it("domain in redirect is valid", function() {
      const expectedResult = true;
      const url = "http://localhost:4200/";

      expect(RouterUtil.isValidRedirect(url)).toEqual(expectedResult);
    });

    it("domain in redirect is invalid", function() {
      const expectedResult = false;
      const url = "http://malicious.domain.com/pwned?localhost:4200";

      expect(RouterUtil.isValidRedirect(url)).toEqual(expectedResult);
    });

    it("get relative path", function() {
      const expectedResult = "/services/detail/%2Fmlancaster/configuration";

      expect(RouterUtil.getRelativePath()).toEqual(expectedResult);
    });

    it("get redirectTo", function() {
      const expectedResult = "http://www.google.com/";

      expect(RouterUtil.getRedirectTo()).toEqual(expectedResult);
    });
  });

  describe("#getQueryStringInUrl", function() {
    const expectedResult = {
      redirect: "http://www.google.com/",
      something: "foo"
    };

    beforeEach(function() {
      const searchQuery = "?redirect=http://www.google.com/&something=foo";

      // Overwrite jsdom global/window location mock
      Object.defineProperty(global.location, "search", {
        writable: true,
        value: searchQuery
      });

      Object.defineProperty(global.location, "hash", {
        writable: true,
        value: `#/some/path${searchQuery}`
      });
    });

    it("get object from search query", function() {
      expect(RouterUtil.getQueryStringInUrl()).toEqual(expectedResult);
    });

    it("get object from hash query", function() {
      expect(RouterUtil.getQueryStringInUrl()).toEqual(expectedResult);
    });
  });

  describe("#getResourceDownloadPath", function() {
    it("constructs path correctly", function() {
      const path = RouterUtil.getResourceDownloadPath(
        "text/plain",
        "text.txt",
        "Some Text"
      );
      expect(path).toEqual(
        "data:text/plain;content-disposition=attachment;filename=text.txt;charset=utf-8,Some%20Text"
      );
    });
    it("returns empty string when data is not declared", function() {
      const path = RouterUtil.getResourceDownloadPath("text/plain", "text.txt");
      expect(path).toEqual("");
    });
  });
});
