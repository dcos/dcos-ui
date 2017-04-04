const router = require('../router');

describe('router', function () {
  beforeEach(function () {

    global.cy = {
      route: jasmine.createSpy('cy.route'),
      fixture(fixtureString) {
        return new Promise(function (resolve) {
          resolve(fixtureString);
        });
      }
    };
  });

  afterEach(function () {
    delete global.cy;
  });

  describe('#clearRoutes', function () {
    it('should clear previously defined routes', function (done) {
      router.route(/foo/, 'fx:bar');
      router.clearRoutes();
      router.getAPIResponse('foo').then(function (foundFixture) {
        expect(foundFixture).toEqual(null);
        done();
      });
    });
  });

  describe('#route', function () {
    beforeEach(function () {
      this.fooRegEx = /foo/;
      this.returnValue = router.route(this.fooRegEx, 'fx:bar');
    });

    afterEach(function () {
      delete this.fooRegEx;
      delete this.returnValue;
    });

    it('should call #route on the global cy object with all arguments', function () {
      expect(global.cy.route).toHaveBeenCalledWith(this.fooRegEx, 'fx:bar');
    });

    it('should return an instance of the router util', function () {
      expect(this.returnValue).toEqual(router);
    });
  });

  describe('#getAPIResponse', function () {
    it('should return a promise which resolves with the fixture when found', function (done) {
      router.route(/foo/, 'fx:bar');
      router.getAPIResponse('foo').then(function (foundFixture) {
        expect(foundFixture).toEqual('bar');
        done();
      });
    });

    it('should return a promise which resovles with null when fixture is not found', function (done) {
      router.getAPIResponse('baz').then(function (foundFixture) {
        expect(foundFixture).toEqual(null);
        done();
      });
    });
  });
});
