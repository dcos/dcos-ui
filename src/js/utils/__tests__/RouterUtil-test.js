jest.dontMock('../RouterUtil');

import {createRoutesFromReactChildren} from 'react-router';
import {Route, Redirect} from 'react-router';
import ReactTestUtils from 'react-addons-test-utils';

import RouterUtil from '../RouterUtil';

describe('RouterUtil', function () {

  describe('#createComponentsFromRoutes', function () {

    beforeEach(function () {
      this.handler = function () {};
    });

    it('creates a react component', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          name: 'foo-bar',
          path: 'foo/?',
          handler: this.handler
        }
      ]);

      expect(ReactTestUtils.isElement(components[0])).toBeTruthy();
    });

    it('creates a react component of correct type', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          name: 'foo-bar',
          path: 'foo/?',
          handler: this.handler
        }
      ]);

      expect(ReactTestUtils.isElementOfType(components[0], Route))
      .toBeTruthy();
    });

    it('sets props correctly', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          name: 'foo-bar',
          path: 'foo/?',
          handler: this.handler
        }
      ]);
      let props = components[0].props;

      expect(props.handler).toEqual(this.handler);
      expect(props.name).toEqual('foo-bar');
      expect(props.path).toEqual('foo/?');
    });

    it('creates child route components', function () {
      let components = RouterUtil.createComponentsFromRoutes([
        {
          type: Route,
          name: 'foo-bar',
          path: 'foo/?',
          handler: this.handler,
          children: [{
            type: Redirect,
            name: 'baz-qux',
            path: 'bar/?'
          }]
        }
      ]);
      let component = components[0].props.children;

      expect(ReactTestUtils.isElementOfType(component, Redirect)).toBeTruthy();
    });

  });

  describe('#setRouteConfiguration', function () {

    beforeEach(function () {
      this.handler = function () {};
      this.routeConfig = [
        {
          type: Route,
          name: 'qux',
          path: 'qux/?',
          handler: this.handler,
          buildBreadCrumb: function () {}
        }
      ];
    })

    it('sets route configurations', function () {
      let components = RouterUtil.createComponentsFromRoutes(this.routeConfig);
      let routes = createRoutesFromReactChildren(components);

      routes = RouterUtil.setRouteConfiguration(routes, this.routeConfig);

      expect(routes[0].buildBreadCrumb).toEqual(
        this.routeConfig[0].buildBreadCrumb
      );
    });

    it('sets route configurations for nested child', function () {
      let routeConfiguration = [
        {
          type: Route,
          name: 'foo',
          path: 'foo/?',
          handler: this.handler,
          children: [{
            type: Route,
            name: 'bar',
            path: 'bar/?',
            handler: this.handler,
            children: [{
              type: Route,
              name: 'baz',
              path: 'baz/?',
              handler: this.handler,
              children: this.routeConfig // This is what we target
            }]
          }]
        }
      ];
      let components = RouterUtil.createComponentsFromRoutes(
        routeConfiguration
      );
      let routes = createRoutesFromReactChildren(components[0]);

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
          type: Route,
          name: 'foo',
          path: 'foo/?',
          handler: function () {},
          buildBreadCrumb: function () {},
          children: [{
            type: Route,
            name: 'bar',
            path: 'bar/?',
            handler: function () {},
            children: [{
              type: Route,
              name: 'baz',
              path: 'baz/?',
              handler: function () {},
              buildBreadCrumb: function () {}
            }]
          }]
        }
      ];

      let routes = RouterUtil.buildRoutes(routeConfiguration);

      // Check first route
      expect(routes[0].name).toEqual('foo');
      expect(routes[0].handler).toEqual(routeConfiguration[0].handler);
      expect(routes[0].buildBreadCrumb).toEqual(routeConfiguration[0].buildBreadCrumb);
      // Check middle route
      expect(routes[0].childRoutes[0].name).toEqual('bar');
      expect(routes[0].childRoutes[0].handler).toEqual(routeConfiguration[0].children[0].handler);
      expect(routes[0].childRoutes[0].buildBreadCrumb).toEqual(undefined);
      // Check last route
      expect(routes[0].childRoutes[0].childRoutes[0].name).toEqual('baz');
      expect(routes[0].childRoutes[0].childRoutes[0].handler).toEqual(routeConfiguration[0].children[0].children[0].handler);
      expect(routes[0].childRoutes[0].childRoutes[0].buildBreadCrumb).toEqual(routeConfiguration[0].children[0].children[0].buildBreadCrumb);
    });

  });

});
