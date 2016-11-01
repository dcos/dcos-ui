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
          path: 'foo',
          component: this.component
        }
      ]);

      expect(ReactTestUtils.isElement(components[0])).toBeTruthy();
    });

    it('creates a react component of correct type', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: 'foo',
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
          path: 'foo',
          component: this.component
        }
      ]);
      let props = components[0].props;

      expect(props.component).toEqual(this.component);
      expect(props.path).toEqual('foo');
    });

    it('creates child route components', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: ReactRouter.Route,
          path: 'foo',
          component: this.component,
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

  describe('#buildRoutes', function () {

    it('builds routes correctly', function () {
      let routeConfiguration = [
        {
          type: ReactRouter.Route,
          path: 'foo',
          component() {},
          buildBreadCrumb() {},
          children: [{
            type: ReactRouter.Route,
            path: 'bar',
            component() {},
            children: [{
              type: ReactRouter.Route,
              path: 'baz',
              component() {},
              buildBreadCrumb() {}
            }]
          }]
        }
      ];

      let routes = RouterUtil.buildRoutes(routeConfiguration);

      // Check first route
      let firstRoute = routes[0];
      expect(firstRoute.path).toEqual('foo');
      expect(firstRoute.component).toEqual(routeConfiguration[0].component);
      expect(firstRoute.buildBreadCrumb)
          .toEqual(routeConfiguration[0].buildBreadCrumb);
      // Check middle route
      let secondRoute = routes[0].childRoutes[0];
      let secondRouteConfig = routeConfiguration[0].children[0];
      expect(secondRoute.path).toEqual('bar');
      expect(secondRoute.component).toEqual(secondRouteConfig.component);
      expect(secondRoute.buildBreadCrumb).toEqual(undefined);
      // Check last route
      let thirdRoute = routes[0].childRoutes[0].childRoutes[0];
      let thirdRouteConfig = routeConfiguration[0].children[0].children[0];
      expect(thirdRoute.path).toEqual('baz');
      expect(thirdRoute.component).toEqual(thirdRouteConfig.component);
      expect(thirdRoute.buildBreadCrumb)
          .toEqual(thirdRouteConfig.buildBreadCrumb);
    });

  });

  describe('#reconstructPathFromRoutes', function () {
    it('constructs path correctly', function () {
      let routes = [
        {path: 'foo'},
        {path: ':id'},
        {path: ':bar/baz'}
      ];
      let path = RouterUtil.reconstructPathFromRoutes(routes);
      expect(path).toEqual('/foo/:id/:bar/baz');
    });

  });

});
