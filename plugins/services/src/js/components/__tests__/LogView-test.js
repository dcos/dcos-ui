jest.dontMock("../../../../../../src/js/mixins/InternalStorageMixin");
jest.dontMock("../Highlight");
jest.dontMock("../LogView");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const EmptyLogScreen = require("../EmptyLogScreen");
const LogView = require("../LogView");
const DOMUtils = require("../../../../../../src/js/utils/DOMUtils");

describe("LogView", function() {
  beforeEach(function() {
    this.fetchPreviousLogsSpy = jasmine.createSpy("#fetchPreviousLogs");
    this.onAtBottomChangeSpy = jasmine.createSpy("#onAtBottomChange");
    this.onCountChangeSpy = jasmine.createSpy("#onCountChange");

    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <LogView
        logName="bar"
        fetchPreviousLogs={this.fetchPreviousLogsSpy}
        onAtBottomChange={this.onAtBottomChangeSpy}
        onCountChange={this.onCountChangeSpy}
      />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#checkIfCloseToTop", function() {
    beforeEach(function() {
      this.previousGetComputed = DOMUtils.getComputedDimensions;

      DOMUtils.getComputedDimensions = function() {
        return { height: 100 };
      };
    });

    afterEach(function() {
      DOMUtils.getComputedDimensions = this.previousGetComputed;
    });

    it("should not call fetchPreviousLogs if past 2000 pixels", function() {
      var container = { scrollTop: 4000 };
      this.instance.checkIfCloseToTop(container);

      expect(this.fetchPreviousLogsSpy).not.toHaveBeenCalled();
    });

    it("should not call fetchPreviousLogs if below 2000 pixels", function() {
      var container = { scrollTop: 1000 };
      this.instance.checkIfCloseToTop(container);

      expect(this.fetchPreviousLogsSpy).toHaveBeenCalled();
    });
  });

  describe("#getLog", function() {
    it("should not show empty log when fullLog is populated", function() {
      this.instance.state.fullLog = "foo";
      var res = this.instance.getLog();
      expect(Array.isArray(res)).toEqual(true);
    });

    it("should get empty screen when log is empty", function() {
      this.instance.state.fullLog = "";
      var res = this.instance.getLog();
      expect(TestUtils.isElementOfType(res, EmptyLogScreen)).toEqual(true);
    });

    it("should call getLog when log is empty", function() {
      this.instance.state.fullLog = "";
      this.instance.getLog = jasmine.createSpy("getLog");
      this.instance.render();
      expect(this.instance.getLog).toHaveBeenCalled();
    });

    it("should call getLog when log is populated", function() {
      this.instance.state.fullLog = "foo";
      this.instance.getLog = jasmine.createSpy("getLog");
      this.instance.render();
      expect(this.instance.getLog).toHaveBeenCalled();
    });
  });

  describe("#getGoToBottomButton", function() {
    it("should not return a button if currently at the bottom", function() {
      this.instance.state.isAtBottom = true;
      var button = this.instance.getGoToBottomButton();
      expect(button).toEqual(null);
    });

    it("should return a button if not at bottom", function() {
      this.instance.state.isAtBottom = false;
      var button = this.instance.getGoToBottomButton();
      expect(TestUtils.isElementOfType(button, "button")).toEqual(true);
    });
  });
});
