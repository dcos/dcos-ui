import React from "react";
import { shallow } from "enzyme";

const TabButton = require("../TabButton");
const TabButtonList = require("../TabButtonList");

let thisChangeHandler, thisInstance;

describe("TabButtonList", function() {
  beforeEach(function() {
    thisChangeHandler = jasmine.createSpy("change handler");
  });

  it("passes onChange as click handler for each TabButton instance", function() {
    thisInstance = shallow(
      <TabButtonList onChange={thisChangeHandler}>
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = thisInstance.find(TabButton);

    instances.forEach(tabButtonInstance => {
      expect(tabButtonInstance.prop("onClick")).toEqual(thisChangeHandler);
    });
  });

  it("sets only first child to active if no active tab is defined", function() {
    thisInstance = shallow(
      <TabButtonList>
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = thisInstance.find(TabButton);

    instances.forEach(function(tabButtonInstance, index) {
      if (index === 0) {
        expect(tabButtonInstance.prop("active")).toBeTruthy();
      } else {
        expect(tabButtonInstance.prop("active")).toBeFalsy();
      }
    });
  });

  it("passes active prop to instance whose ID matches activeTab", function() {
    thisInstance = shallow(
      <TabButtonList activeTab="bar">
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = thisInstance.find(TabButton);

    instances.forEach(function(tabButtonInstance) {
      if (tabButtonInstance.prop("id") === "bar") {
        expect(tabButtonInstance.prop("active")).toBeTruthy();
      } else {
        expect(tabButtonInstance.prop("active")).toBeFalsy();
      }
    });
  });
});
