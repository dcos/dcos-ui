/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const JestUtil = require("#SRC/js/utils/JestUtil");
const DSLExpression = require("#SRC/js/structs/DSLExpression");
const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

const ServicesContainer = require("../ServicesContainer");

describe("ServicesContainer", function() {
  beforeEach(function() {
    this.storeChangeListener = MesosStateStore.addChangeListener;
    MesosStateStore.addChangeListener = function() {};

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
    MesosStateStore.addChangeListener = this.storeChangeListener;
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
