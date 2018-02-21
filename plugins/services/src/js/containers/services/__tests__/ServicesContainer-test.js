jest.mock("#SRC/js/stores/DCOSStore");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const JestUtil = require("#SRC/js/utils/JestUtil");
const DSLExpression = require("#SRC/js/structs/DSLExpression");
const MesosStateStore = require("#SRC/js/stores/MesosStateStore");
const DCOSStore = require("#SRC/js/stores/DCOSStore");
const Service = require("#PLUGINS/services/src/js/structs/Service");

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

  describe("#getCorrectedModalProps", function() {
    const storeService = new Service({ id: "/test" });
    beforeEach(function() {
      DCOSStore.serviceTree = {
        findItemById() {
          return storeService;
        }
      };
    });

    it("returns modalProps from state with updated service information for given existing service (state)", function() {
      const modalProps = this.instance.getCorrectedModalProps(
        { service: storeService },
        undefined
      );
      expect(modalProps).toEqual({ service: storeService });
    });

    it("returns modalProps from argument with updated service information for given existing service (argument)", function() {
      const modalProps = this.instance.getCorrectedModalProps(
        { service: undefined },
        storeService
      );
      expect(modalProps).toEqual({ service: storeService });
    });

    it("returns modalProps from state with updated service information for given existing service (both)", function() {
      const modalProps = this.instance.getCorrectedModalProps(
        { service: storeService },
        new Service({ id: "/test2" })
      );
      expect(modalProps).toEqual({ service: storeService });
    });

    // the following two tests are the ones which broke the modals before.
    // the important part is, that `service` is never undefined
    // (because DCOSStore returns nothing) while a modal is (still)
    // open.
    // if service is "unknown", we have to fill in "something" in `service`
    // and delete the `id` node. this will close the modal.

    it("returns empty modalProps if no service is given but id is set", function() {
      DCOSStore.serviceTree = {
        findItemById() {
          return undefined;
        }
      };
      const modalProps = this.instance.getCorrectedModalProps(
        { id: "delete", service: undefined },
        undefined
      );
      expect(modalProps).toEqual({});
    });

    it("returns modalProps without id for already deleted service", function() {
      DCOSStore.serviceTree = {
        findItemById() {
          return undefined;
        }
      };
      const modalProps = this.instance.getCorrectedModalProps(
        { id: "delete", service: new Service({ id: "/deleted" }) },
        undefined
      );
      expect(modalProps).toEqual({ service: new Service({ id: "/deleted" }) });
    });
  });
});
