jest.dontMock("objektiv");
jest.dontMock("../ServicesContainer");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");
const JestUtil = require("../../../../../../../src/js/utils/JestUtil");

const ServicesContainer = require("../ServicesContainer");
const DSLExpression = require("../../../../../../../src/js/structs/DSLExpression");

describe("ServicesContainer", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.routerStubs = {
      getCurrentPathname() {
        return "test";
      },
      push: jasmine.createSpy()
    };
    this.wrapper = ReactDOM.render(
      JestUtil.stubRouterContext(
        ServicesContainer,
        {
          location: { query: {}, pathname: "/test" },
          params: {}
        },
        this.routerStubs
      ),
      this.container
    );
    this.instance = TestUtils.findRenderedComponentWithType(
      this.wrapper,
      ServicesContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#setQueryParams", function() {
    it("updates window location with correct query params", function() {
      this.instance.handleFilterExpressionChange(new DSLExpression("foo"));

      expect(this.routerStubs.push.calls.mostRecent().args).toEqual([
        { pathname: "/test", query: { q: "foo" } }
      ]);

      this.instance.handleFilterExpressionChange(new DSLExpression("bar"));

      expect(this.routerStubs.push.calls.mostRecent().args).toEqual([
        { pathname: "/test", query: { q: "bar" } }
      ]);
    });
  });
});
