const router = require("../router");

describe("router", () => {
  beforeEach(function () {
    this.originalCy = cy;

    global.cy = {
      route: cy.spy(),
      fixture(fixtureString) {
        return new Promise((resolve) => {
          resolve(fixtureString);
        });
      },
    };
  });

  afterEach(function () {
    global.cy = this.originalCy;
  });

  describe("#route", () => {
    beforeEach(function () {
      this.fooRegEx = /foo/;
      this.returnValue = router.route(this.fooRegEx, "fx:bar");
    });

    afterEach(function () {
      delete this.fooRegEx;
      delete this.returnValue;
    });

    it("calls #route on the global cy object with all arguments", function () {
      expect(global.cy.route.calledWith(this.fooRegEx, "fx:bar")).to.equal(
        true
      );
    });

    it("returns an instance of the router util", function () {
      expect(this.returnValue).to.equal(router);
    });
  });
});
