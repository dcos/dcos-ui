jest.dontMock('../RouterUtil');

const ReactRouter = require('react-router');
const ReactTestUtils = require('react-addons-test-utils');

const RouterUtil = require('../RouterUtil');

describe('RouterUtil', function () {

  describe('#createComponentsFromRoutes', function () {

    beforeEach(function () {
      this.handler = function () {};
    });

    it('creates a react component', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: 'foo',
          handler: this.handler
        }
      ]);

      expect(ReactTestUtils.isElement(components[0])).toBeTruthy();
    });

    it('creates a react component of correct type', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: 'foo',
          handler: this.handler
        }
      ]);

      expect(ReactTestUtils.isElementOfType(components[0], ReactRouter.Route))
      .toBeTruthy();
    });

    it('sets props correctly', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: 'foo',
          handler: this.handler
        }
      ]);
      let props = components[0].props;

      expect(props.handler).toEqual(this.handler);
      expect(props.path).toEqual('foo');
    });

    it('creates child route components', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: 'foo',
          handler: this.handler,
          children: [{
            type: ReactRouter.Redirect,
            path: 'bar',
            to: 'baz'
          }]
        }
      ]);
      let component = components[0].props.children;

      expect(ReactTestUtils.isElementOfType(component, ReactRouter.Redirect))
          .toBeTruthy();
    });

  });

  describe('#setRouteConfiguration', function () {

    beforeEach(function () {
      this.handler = function () {};
      this.routeConfig = [
        {
          type: ReactRouter.Route,
          path: 'qux',
          handler: this.handler,
          buildBreadCrumb() {}
        }
      ];
    });

    it('sets route configurations', function () {
      let components = RouterUtil.createComponentsFromRoutes(this.routeConfig);
      let routes = ReactRouter.createRoutesFromReactChildren(components);

      routes = RouterUtil.setRouteConfiguration(routes, this.routeConfig);

      expect(routes[0].buildBreadCrumb).toEqual(
        this.routeConfig[0].buildBreadCrumb
      );
    });

    it('sets route configurations for nested child', function () {
      let routeConfiguration = [
        {
          type: ReactRouter.Route,
          path: 'foo',
          handler: this.handler,
          children: [{
            type: ReactRouter.Route,
            path: 'bar',
            handler: this.handler,
            children: [{
              type: ReactRouter.Route,
              path: 'baz',
              handler: this.handler,
              children: this.routeConfig // This is what we target
            }]
          }]
        }
      ];
      let components = RouterUtil.createComponentsFromRoutes(
        routeConfiguration
      );
      let routes = ReactRouter.createRoutesFromReactChildren(components[0]);

      routes = RouterUtil.setRouteConfiguration(routes, routeConfiguration);

      expect(
        routes[0].childRoutes[0].childRoutes[0].childRoutes[0].buildBreadCrumb
      )
      .toEqual(this.routeConfig[0].buildBreadCrumb);
    });

  });

  describe('#buildRoutes', function () {

    it('builds routes correctly', function () {
      let routeConfiguration = [
        {
          type: ReactRouter.Route,
          path: 'foo',
          handler() {},
          buildBreadCrumb() {},
          children: [{
            type: ReactRouter.Route,
            path: 'bar',
            handler() {},
            children: [{
              type: ReactRouter.Route,
              path: 'baz',
              handler() {},
              buildBreadCrumb() {}
            }]
          }]
        }
      ];

      let routes = RouterUtil.buildRoutes(routeConfiguration);

      // Check first route
      let firstRoute = routes[0];
      expect(firstRoute.path).toEqual('/foo');
      expect(firstRoute.handler).toEqual(routeConfiguration[0].handler);
      expect(firstRoute.buildBreadCrumb)
          .toEqual(routeConfiguration[0].buildBreadCrumb);
      // Check middle route
      let secondRoute = routes[0].childRoutes[0];
      let secondRouteConfig = routeConfiguration[0].children[0];
      expect(secondRoute.path).toEqual('/foo/bar');
      expect(secondRoute.handler).toEqual(secondRouteConfig.handler);
      expect(secondRoute.buildBreadCrumb).toEqual(undefined);
      // Check last route
      let thirdRoute = routes[0].childRoutes[0].childRoutes[0];
      let thirdRouteConfig = routeConfiguration[0].children[0].children[0];
      expect(thirdRoute.path).toEqual('/foo/bar/baz');
      expect(thirdRoute.handler).toEqual(thirdRouteConfig.handler);
      expect(thirdRoute.buildBreadCrumb)
          .toEqual(thirdRouteConfig.buildBreadCrumb);
    });

  });

});
