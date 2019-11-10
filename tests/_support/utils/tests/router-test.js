const router = require("../router");

describe("router", () => {
  beforeEach(function() {
    this.originalCy = cy;

    global.cy = {
      route: cy.spy(),
      fixture(fixtureString) {
        return new Promise(resolve => {
          resolve(fixtureString);
        });
      }
    };
  });

  afterEach(function() {
    global.cy = this.originalCy;
  });

  describe("#clearRoutes", () => {
    it("clears previously defined routes", done => {
      router.route(/foo/, "fx:bar");
      router.clearRoutes();
      router.getAPIResponse("foo", foundFixture => {
        expect(foundFixture).to.equal(null);
        done();
      });
    });
  });

  describe("#route", () => {
    beforeEach(function() {
      this.fooRegEx = /foo/;
      this.returnValue = router.route(this.fooRegEx, "fx:bar");
    });

    afterEach(function() {
      delete this.fooRegEx;
      delete this.returnValue;
    });

    it("calls #route on the global cy object with all arguments", function() {
      expect(global.cy.route.calledWith(this.fooRegEx, "fx:bar")).to.equal(
        true
      );
    });

    it("returns an instance of the router util", function() {
      expect(this.returnValue).to.equal(router);
    });
  });

  describe("#getAPIResponse", () => {
    it("calls the callback with the fixture when found", done => {
      router.route(/foo/, "fx:bar");
      router.getAPIResponse("foo", foundFixture => {
        expect(foundFixture).to.equal("bar");
        done();
      });
    });

    it("calls the callback with null when the fixture is not found", done => {
      router.getAPIResponse("baz", foundFixture => {
        expect(foundFixture).to.equal(null);
        done();
      });
    });
  });
});
