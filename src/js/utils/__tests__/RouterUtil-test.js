import { Route, Redirect } from "react-router";

const RouterUtil = require("../RouterUtil");

let thisComponent;

describe("RouterUtil", () => {
  describe("#createComponentsFromRoutes", () => {
    beforeEach(() => {
      thisComponent = () => {};
    });

    it("creates a react component", () => {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          path: "foo",
          component: thisComponent
        }
      ]);

      expect(components[0]).toBeInstanceOf(Object);
    });

    it("creates a react component of correct type", () => {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          path: "foo",
          component: thisComponent
        }
      ]);

      expect(components[0].type.displayName).toBe("Route");
    });

    it("sets props correctly", () => {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          path: "foo",
          component: thisComponent
        }
      ]);
      const props = components[0].props;

      expect(props.component).toEqual(thisComponent);
      expect(props.path).toEqual("foo");
    });

    it("creates child route components", () => {
      const components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          path: "foo",
          component: thisComponent,
          children: [
            {
              type: Redirect,
              path: "bar",
              to: "baz"
            }
          ]
        }
      ]);
      const component = components[0].props.children;

      expect(component.type.displayName).toBe("Redirect");
    });
  });

  describe("#buildRoutes", () => {
    it("builds routes correctly", () => {
      const routeConfiguration = [
        {
          type: Route,
          path: "foo",
          component() {},
          children: [
            {
              type: Route,
              path: "bar",
              component() {},
              children: [
                {
                  type: Route,
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

  describe("#reconstructPathFromRoutes", () => {
    it("constructs path correctly", () => {
      const routes = [{ path: "foo" }, { path: ":id" }, { path: ":bar/baz" }];
      const path = RouterUtil.reconstructPathFromRoutes(routes);
      expect(path).toEqual("/foo/:id/:bar/baz");
    });
  });

  describe("#getCorrectedFilePathRoute", () => {
    it("does not augment the path if there is a :filePath placeholder", () => {
      expect(
        RouterUtil.getCorrectedFileRoutePath(
          "/services/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))"
        )
      ).toBe(
        "/services/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))"
      );
    });

    it("does augment the path without a / if there is no placeholder", () => {
      expect(
        RouterUtil.getCorrectedFileRoutePath(
          "/services/detail/:id/tasks/:taskID/files/view"
        )
      ).toBe("/services/detail/:id/tasks/:taskID/files/view/:filePath");
    });

    it("does augment the path with a / if there is no placeholder and no /", () => {
      expect(
        RouterUtil.getCorrectedFileRoutePath(
          "/services/detail/:id/tasks/:taskID/files/view/"
        )
      ).toBe("/services/detail/:id/tasks/:taskID/files/view/:filePath");
    });
  });

  describe("#redirect", () => {
    it("domain in redirect is valid", () => {
      const expectedResult = true;
      const url = "http://localhost:4200/";

      expect(RouterUtil.isValidRedirect(url, "localhost")).toEqual(
        expectedResult
      );
    });

    it("domain in redirect is invalid", () => {
      const expectedResult = false;
      const url = "http://malicious.domain.com/pwned?localhost:4200";

      expect(RouterUtil.isValidRedirect(url, "localhost")).toEqual(
        expectedResult
      );
    });

    it("get relative path", () => {
      const expectedResult = "/services/detail/%2Fmlancaster/configuration";

      expect(
        RouterUtil.getRelativePath(
          "http://localhost:4200/#/login?relativePath=/services/detail/%2Fmlancaster/configuration"
        )
      ).toEqual(expectedResult);
    });

    it("get redirectTo", () => {
      const expectedResult = "http://www.google.com/";

      expect(
        RouterUtil.getRedirectTo(
          "?redirect=http://www.google.com/&something=foo"
        )
      ).toEqual(expectedResult);
    });
  });

  describe("#getQueryStringInUrl", () => {
    const expectedResult = {
      redirect: "http://www.google.com/",
      something: "foo"
    };
    const searchQuery = "?redirect=http://www.google.com/&something=foo";
    const hash = `#/some/path${searchQuery}`;

    it("get object from search query", () => {
      expect(RouterUtil.getQueryStringInUrl(searchQuery)).toEqual(
        expectedResult
      );
    });

    it("get object from hash query", () => {
      expect(RouterUtil.getQueryStringInUrl(searchQuery, hash)).toEqual(
        expectedResult
      );
    });
  });

  describe("#getResourceDownloadPath", () => {
    it("constructs path correctly", () => {
      const path = RouterUtil.getResourceDownloadPath(
        "text/plain",
        "text.txt",
        "Some Text"
      );
      expect(path).toEqual(
        "data:text/plain;content-disposition=attachment;filename=text.txt;charset=utf-8,Some%20Text"
      );
    });
    it("returns empty string when data is not declared", () => {
      const path = RouterUtil.getResourceDownloadPath("text/plain", "text.txt");
      expect(path).toEqual("");
    });
  });
});
