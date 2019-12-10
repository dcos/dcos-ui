import React from "react";
import { mount } from "enzyme";

import DOMUtils from "#SRC/js/utils/DOMUtils";
import EmptyLogScreen from "../EmptyLogScreen";
import LogView from "../LogView";

let thisFetchPreviousLogsSpy,
  thisOnAtBottomChangeSpy,
  thisOnCountChangeSpy,
  thisInstance,
  thisPreviousGetComputed;

describe("LogView", () => {
  beforeEach(() => {
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

  describe("#checkIfCloseToTop", () => {
    beforeEach(() => {
      thisPreviousGetComputed = DOMUtils.getComputedDimensions;

      DOMUtils.getComputedDimensions = () => ({
        height: 100
      });
    });

    afterEach(() => {
      DOMUtils.getComputedDimensions = thisPreviousGetComputed;
    });

    it("does not call fetchPreviousLogs if past 2000 pixels", () => {
      var container = { scrollTop: 4000 };
      thisInstance.instance().checkIfCloseToTop(container);

      expect(thisFetchPreviousLogsSpy).not.toHaveBeenCalled();
    });

    it("does not call fetchPreviousLogs if below 2000 pixels", () => {
      var container = { scrollTop: 1000 };
      thisInstance.instance().checkIfCloseToTop(container);

      expect(thisFetchPreviousLogsSpy).toHaveBeenCalled();
    });
  });

  describe("#getLog", () => {
    it("does not show empty log when fullLog is populated", () => {
      thisInstance.setState({ fullLog: "foo" });
      var res = thisInstance.instance().getLog();
      expect(Array.isArray(res)).toEqual(true);
    });

    it("gets empty screen when log is empty", () => {
      thisInstance.setState({ fullLog: "" });
      var res = thisInstance.instance().getLog();
      expect(res.type).toEqual(EmptyLogScreen);
    });
  });

  describe("#getGoToBottomButton", () => {
    it("does not return a button if currently at the bottom", () => {
      thisInstance.setState({ isAtBottom: true });
      var button = thisInstance.instance().getGoToBottomButton();
      expect(button).toEqual(null);
    });

    it("returns a button if not at bottom", () => {
      thisInstance.setState({ isAtBottom: false });
      var button = thisInstance.instance().getGoToBottomButton();
      expect(button.type).toEqual("button");
    });
  });
});
