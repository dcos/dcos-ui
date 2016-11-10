jest.dontMock('../RoutingService');
const RoutingService = require('../RoutingService').default;
const ReactRouter = require('react-router');

describe('RoutingService', function () {

  beforeEach(function () {
    this.routes = [];
  });

  afterEach(function () {
    RoutingService.clearPending();
  });

  describe('#resolveWith', function () {

    it('does not modify provided routes if there are no routes pending', function () {
      RoutingService.resolveWith(this.routes);

      expect(this.routes).toEqual([]);
    });

    it('adds a pending Page route', function () {
      RoutingService.registerPage('test', Object);
      RoutingService.resolveWith(this.routes);

      expect(this.routes).toEqual([{
        type: ReactRouter.Route,
        path: 'test',
        component: Object
      }]);
    });

    it('adds a pending Tab route to a Page', function () {
      RoutingService.registerPage('test', Object);
      RoutingService.registerTab('test', 'tab', Object);
      RoutingService.resolveWith(this.routes);

      expect(this.routes).toEqual([{
        type: ReactRouter.Route,
        path: 'test',
        component: Object,
        children: [{
          type: ReactRouter.Route,
          path: 'tab',
          component: Object
        }]
      }]);
    });

    it('adds a pending Redirect route', function () {
      RoutingService.registerRedirect('test', 'stage');
      RoutingService.resolveWith(this.routes);

      expect(this.routes).toEqual([{
        type: ReactRouter.Redirect,
        path: 'test',
        to: 'stage'
      }]);
    });

    describe('idempotency', function () {

      it('does not add a duplicate Page', function () {
        this.routes = [{
          type: ReactRouter.Route,
          path: 'test',
          component: Object
        }];

        RoutingService.registerPage('test', Object);
        RoutingService.resolveWith(this.routes);

        expect(this.routes).toEqual([{
          type: ReactRouter.Route,
          path: 'test',
          component: Object
        }]);
      });

      it('does not add a duplicate Tab', function () {
        this.routes = [{
          type: ReactRouter.Route,
          path: 'test',
          component: Object,
          children: [{
            type: ReactRouter.Route,
            path: 'tab',
            component: Object
          }]
        }];

        RoutingService.registerTab('test', 'tab', Object);
        RoutingService.resolveWith(this.routes);

        expect(this.routes).toEqual([{
          type: ReactRouter.Route,
          path: 'test',
          component: Object,
          children: [{
            type: ReactRouter.Route,
            path: 'tab',
            component: Object
          }]
        }]);
      });

      it('does not add a duplicate Redirect', function () {
        this.routes = [{
          type: ReactRouter.Redirect,
          path: 'test',
          to: 'stage'
        }];

        RoutingService.registerRedirect('test', 'stage');
        RoutingService.resolveWith(this.routes);

        expect(this.routes).toEqual([{
          type: ReactRouter.Redirect,
          path: 'test',
          to: 'stage'
        }]);

      });

    });

    describe('override protection', function () {

      it('throws on an attempt to override a page with a different component', function () {
        this.routes = [{
          type: ReactRouter.Route,
          path: 'test'
        }];

        RoutingService.registerPage('test', Object);

        expect(() => {
          RoutingService.resolveWith(this.routes);
        }).toThrow(new Error('Attempt to override a page at test!'));
      });

      it('throws on an attempt to override a Tab', function () {
        this.routes = [{
          type: ReactRouter.Route,
          path: 'test',
          component: Object,
          children: [{
            type: ReactRouter.Route,
            path: 'tab'
          }]
        }];

        RoutingService.registerTab('test', 'tab', Object);

        expect(() => {
          RoutingService.resolveWith(this.routes);
        }).toThrow(new Error('Attempt to override a tab at test/tab!'));
      });

      it('does not add a duplicate Redirect', function () {
        this.routes = [{
          type: ReactRouter.Redirect,
          path: 'test',
          to: 'testB'
        }];

        RoutingService.registerRedirect('test', 'stage');

        expect(() => {
          RoutingService.resolveWith(this.routes);
        }).toThrow(new Error('Attempt to override Redirect of test from testB to stage!'));

      });

    });

  });

});
