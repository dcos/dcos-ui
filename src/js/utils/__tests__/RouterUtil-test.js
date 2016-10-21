jest.dontMock('../RouterUtil');

const ReactRouter = require('react-router');
const ReactTestUtils = require('react-addons-test-utils');

const RouterUtil = require('../RouterUtil');

describe('RouterUtil', function () {

  describe('#createComponentsFromRoutes', function () {

    beforeEach(function () {
      this.component = function () {};
    });

    it('creates a react component', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          name: 'foo-bar',
          path: 'foo/?',
          component: this.component
        }
      ]);

      expect(ReactTestUtils.isElement(components[0])).toBeTruthy();
    });

    it('creates a react component of correct type', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          name: 'foo-bar',
          path: 'foo/?',
          component: this.component
        }
      ]);

      expect(ReactTestUtils.isElementOfType(components[0], ReactRouter.Route))
      .toBeTruthy();
    });

    it('sets props correctly', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          name: 'foo-bar',
          path: 'foo/?',
          component: this.component
        }
      ]);
      let props = components[0].props;

      expect(props.component).toEqual(this.component);
      expect(props.name).toEqual('foo-bar');
      expect(props.path).toEqual('foo/?');
    });

    it('creates child route components', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          name: 'foo-bar',
          path: 'foo/?',
          component: this.component,
          children: [{
            type: ReactRouter.Redirect,
            name: 'baz-qux',
            path: 'bar/?'
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
      this.component = function () {};
      this.routeConfig = [
        {
          type: ReactRouter.Route,
          name: 'qux',
          path: 'qux/?',
          component: this.component,
          buildBreadCrumb() {}
        }
      ];
    });

    it('sets route configurations', function () {
      let components = RouterUtil.createComponentsFromRoutes(this.routeConfig);
      let routes = ReactRouter.createRoutes(components);

      routes = RouterUtil.setRouteConfiguration(routes, this.routeConfig);

      expect(routes[0].buildBreadCrumb).toEqual(
        this.routeConfig[0].buildBreadCrumb
      );
    });

    it('sets route configurations for nested child', function () {
      let routeConfiguration = [
        {
          type: ReactRouter.Route,
          name: 'foo',
          path: 'foo/?',
          component: this.component,
          children: [{
            type: ReactRouter.Route,
            name: 'bar',
            path: 'bar/?',
            component: this.component,
            children: [{
              type: ReactRouter.Route,
              name: 'baz',
              path: 'baz/?',
              component: this.component,
              children: this.routeConfig // This is what we target
            }]
          }]
        }
      ];
      let components = RouterUtil.createComponentsFromRoutes(
        routeConfiguration
      );
      let routes = ReactRouter.createRoutes(components[0]);

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
          name: 'foo',
          path: 'foo/?',
          component() {},
          buildBreadCrumb() {},
          children: [{
            type: ReactRouter.Route,
            name: 'bar',
            path: 'bar/?',
            component() {},
            children: [{
              type: ReactRouter.Route,
              name: 'baz',
              path: 'baz/?',
              component() {},
              buildBreadCrumb() {}
            }]
          }]
        }
      ];

      let routes = RouterUtil.buildRoutes(routeConfiguration);

      // Check first route
      let firstRoute = routes[0];
      expect(firstRoute.name).toEqual('foo');
      expect(firstRoute.component).toEqual(routeConfiguration[0].component);
      expect(firstRoute.buildBreadCrumb)
          .toEqual(routeConfiguration[0].buildBreadCrumb);
      // Check middle route
      let secondRoute = routes[0].childRoutes[0];
      let secondRouteConfig = routeConfiguration[0].children[0];
      expect(secondRoute.name).toEqual('bar');
      expect(secondRoute.component).toEqual(secondRouteConfig.component);
      expect(secondRoute.buildBreadCrumb).toEqual(undefined);
      // Check last route
      let thirdRoute = routes[0].childRoutes[0].childRoutes[0];
      let thirdRouteConfig = routeConfiguration[0].children[0].children[0];
      expect(thirdRoute.name).toEqual('baz');
      expect(thirdRoute.component).toEqual(thirdRouteConfig.component);
      expect(thirdRoute.buildBreadCrumb)
          .toEqual(thirdRouteConfig.buildBreadCrumb);
    });

  });

});
