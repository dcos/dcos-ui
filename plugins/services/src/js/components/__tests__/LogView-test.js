/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const EmptyLogScreen = require("../EmptyLogScreen");
const LogView = require("../LogView");
const DOMUtils = require("#SRC/js/utils/DOMUtils");

let thisFetchPreviousLogsSpy,
  thisOnAtBottomChangeSpy,
  thisOnCountChangeSpy,
  thisContainer,
  thisInstance,
  thisPreviousGetComputed;

describe("LogView", function() {
  beforeEach(function() {
    thisFetchPreviousLogsSpy = jasmine.createSpy("#fetchPreviousLogs");
    thisOnAtBottomChangeSpy = jasmine.createSpy("#onAtBottomChange");
    thisOnCountChangeSpy = jasmine.createSpy("#onCountChange");

    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <LogView
        logName="bar"
        fetchPreviousLogs={thisFetchPreviousLogsSpy}
        onAtBottomChange={thisOnAtBottomChangeSpy}
        onCountChange={thisOnCountChangeSpy}
      />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#checkIfCloseToTop", function() {
    beforeEach(function() {
      thisPreviousGetComputed = DOMUtils.getComputedDimensions;

      DOMUtils.getComputedDimensions = function() {
        return { height: 100 };
      };
    });

    afterEach(function() {
      DOMUtils.getComputedDimensions = thisPreviousGetComputed;
    });

    it("does not call fetchPreviousLogs if past 2000 pixels", function() {
      var container = { scrollTop: 4000 };
      thisInstance.checkIfCloseToTop(container);

      expect(thisFetchPreviousLogsSpy).not.toHaveBeenCalled();
    });

    it("does not call fetchPreviousLogs if below 2000 pixels", function() {
      var container = { scrollTop: 1000 };
      thisInstance.checkIfCloseToTop(container);

      expect(thisFetchPreviousLogsSpy).toHaveBeenCalled();
    });
  });

  describe("#getLog", function() {
    it("does not show empty log when fullLog is populated", function() {
      thisInstance.state.fullLog = "foo";
      var res = thisInstance.getLog();
      expect(Array.isArray(res)).toEqual(true);
    });

    it("gets empty screen when log is empty", function() {
      thisInstance.state.fullLog = "";
      var res = thisInstance.getLog();
      expect(TestUtils.isElementOfType(res, EmptyLogScreen)).toEqual(true);
    });

    it("calls getLog when log is empty", function() {
      thisInstance.state.fullLog = "";
      thisInstance.getLog = jasmine.createSpy("getLog");
      thisInstance.render();
      expect(thisInstance.getLog).toHaveBeenCalled();
    });

    it("calls getLog when log is populated", function() {
      thisInstance.state.fullLog = "foo";
      thisInstance.getLog = jasmine.createSpy("getLog");
      thisInstance.render();
      expect(thisInstance.getLog).toHaveBeenCalled();
    });
  });

  describe("#getGoToBottomButton", function() {
    it("does not return a button if currently at the bottom", function() {
      thisInstance.state.isAtBottom = true;
      var button = thisInstance.getGoToBottomButton();
      expect(button).toEqual(null);
    });

    it("returns a button if not at bottom", function() {
      thisInstance.state.isAtBottom = false;
      var button = thisInstance.getGoToBottomButton();
      expect(TestUtils.isElementOfType(button, "button")).toEqual(true);
    });
  });
});
