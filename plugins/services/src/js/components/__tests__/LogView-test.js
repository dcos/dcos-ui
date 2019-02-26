import React from "react";
import { mount } from "enzyme";

const EmptyLogScreen = require("../EmptyLogScreen");
const LogView = require("../LogView");
const DOMUtils = require("#SRC/js/utils/DOMUtils");

let thisFetchPreviousLogsSpy,
  thisOnAtBottomChangeSpy,
  thisOnCountChangeSpy,
  thisInstance,
  thisPreviousGetComputed;

describe("LogView", function() {
  beforeEach(function() {
    thisFetchPreviousLogsSpy = jasmine.createSpy("#fetchPreviousLogs");
    thisOnAtBottomChangeSpy = jasmine.createSpy("#onAtBottomChange");
    thisOnCountChangeSpy = jasmine.createSpy("#onCountChange");

    thisInstance = mount(
      <LogView
        logName="bar"
        fetchPreviousLogs={thisFetchPreviousLogsSpy}
        onAtBottomChange={thisOnAtBottomChangeSpy}
        onCountChange={thisOnCountChangeSpy}
      />
    );
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
      thisInstance.instance().checkIfCloseToTop(container);

      expect(thisFetchPreviousLogsSpy).not.toHaveBeenCalled();
    });

    it("does not call fetchPreviousLogs if below 2000 pixels", function() {
      var container = { scrollTop: 1000 };
      thisInstance.instance().checkIfCloseToTop(container);

      expect(thisFetchPreviousLogsSpy).toHaveBeenCalled();
    });
  });

  describe("#getLog", function() {
    it("does not show empty log when fullLog is populated", function() {
      thisInstance.setState({ fullLog: "foo" });
      var res = thisInstance.instance().getLog();
      expect(Array.isArray(res)).toEqual(true);
    });

    it("gets empty screen when log is empty", function() {
      thisInstance.setState({ fullLog: "" });
      var res = thisInstance.instance().getLog();
      expect(res.type).toEqual(EmptyLogScreen);
    });
  });

  describe("#getGoToBottomButton", function() {
    it("does not return a button if currently at the bottom", function() {
      thisInstance.setState({ isAtBottom: true });
      var button = thisInstance.instance().getGoToBottomButton();
      expect(button).toEqual(null);
    });

    it("returns a button if not at bottom", function() {
      thisInstance.setState({ isAtBottom: false });
      var transition = thisInstance.instance().getGoToBottomButton();
      var button = transition.props.children;
      expect(button.type).toEqual("button");
    });
  });
});
